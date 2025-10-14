import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

// Importar colores
const COLORS = {
  primary: "#F26457",
  text: "#000000",
  textSecondary: "#666666",
  textDark: "#000000",
  background: "#F2F2F2",
  cardBackground: "#FFFFFF",
  inputBackground: "#FFFFFF",
  success: "#27AE60",
  warning: "#F39C12",
  error: "#E74C3C",
  info: "#3498DB",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#95A5A6",
  lightGray: "#ECF0F1",
  border: "#DDDDDD",
  placeholderText: "#B9B9B9",
  danger: "#E74C3C",
};

export class PdfGenerator {
  // Función auxiliar para formatear fecha
  static formatDate(date) {
    if (!date) return "No registrada";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Función auxiliar para formatear hora
  static formatTime(date) {
    if (!date) return "No registrada";
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Función auxiliar para formatear fecha y hora completas
  static formatDateTime(date) {
    if (!date) return "No registrada";
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Función para calcular duración entre entrada y salida
  static calculateDuration(entrada, salida) {
    if (!entrada) return "No disponible";

    const entradaTime = new Date(entrada);
    const salidaTime = salida ? new Date(salida) : new Date(); // Si no hay salida, usar hora actual

    const diferencia = salidaTime - entradaTime;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    if (horas === 0 && minutos === 0) {
      return "0m";
    } else if (horas === 0) {
      return `${minutos}m`;
    } else if (minutos === 0) {
      return `${horas}h`;
    } else {
      return `${horas}h ${minutos}m`;
    }
  }

  // Generar las últimas 24 horas desde la hora más antigua a la más reciente
  static generateLast24Hours() {
    const hours = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(now.getHours() - i, 0, 0, 0);
      const hourString = `${hour.getHours().toString().padStart(2, "0")}:00`;
      const dateString = hour.toLocaleDateString("es-ES");

      hours.push({
        hora: hourString,
        fecha: dateString,
        fechaCompleta: hour,
        timestamp: hour.getTime(),
        key: `${dateString}_${hourString}`,
      });
    }

    return hours;
  }

  // Generar horas desde 00:00 hasta la hora actual de los últimos 7 días (orden cronológico)
  static generateLast7DaysWithHours() {
    const allHours = [];
    const now = new Date();
    const currentHour = now.getHours();

    for (let day = 6; day >= 0; day--) {
      const currentDay = new Date(now);
      currentDay.setDate(now.getDate() - day);

      // Determinar la hora máxima para este día
      let maxHour = 23;
      if (day === 0) {
        maxHour = currentHour;
      }

      // Generar horas desde 00:00 hasta la hora máxima
      for (let hour = 0; hour <= maxHour; hour++) {
        const hourTime = new Date(currentDay);
        hourTime.setHours(hour, 0, 0, 0);
        const hourString = `${hour.toString().padStart(2, "0")}:00`;
        const dateString = hourTime.toLocaleDateString("es-ES");

        allHours.push({
          hora: hourString,
          fecha: dateString,
          fechaCompleta: hourTime,
          timestamp: hourTime.getTime(),
          key: `${dateString}_${hourString}`,
        });
      }
    }

    return allHours;
  }

  // Función para obtener guardias activos en una hora específica - CORREGIDA
  static getActiveGuardsAtTime(guards, horaEsperada) {
    if (!guards || !Array.isArray(guards)) return [];

    const horaObjetivo = new Date(horaEsperada.fechaCompleta);
    const horaObjetivoFin = new Date(horaObjetivo);
    horaObjetivoFin.setHours(horaObjetivo.getHours() + 1, 0, 0, 0);

    return guards.filter((guard) => {
      if (!guard.entrada) return false;

      try {
        const entradaTime = new Date(guard.entrada);
        const salidaTime = guard.salida ? new Date(guard.salida) : null;

        // El guardia está activo si:
        // 1. Entró antes del FIN de la hora objetivo Y
        // 2. (No tiene salida registrada O salió después del INICIO de la hora objetivo)
        const entroAntesDelFin = entradaTime < horaObjetivoFin;
        const salioDespuesDelInicio = !salidaTime || salidaTime > horaObjetivo;

        return entroAntesDelFin && salioDespuesDelInicio;
      } catch (error) {
        console.log("Error al procesar fecha del guardia:", error);
        return false;
      }
    });
  }

  // Función para determinar el estado del guardia en una hora específica
  static getGuardStatusAtTime(guard, horaEsperada) {
    if (!guard.entrada) return "inactivo";

    try {
      const entradaTime = new Date(guard.entrada);
      const salidaTime = guard.salida ? new Date(guard.salida) : null;
      const horaObjetivo = new Date(horaEsperada.fechaCompleta);
      const horaObjetivoFin = new Date(horaObjetivo);
      horaObjetivoFin.setHours(horaObjetivo.getHours() + 1, 0, 0, 0);

      const entroEnEstaHora = entradaTime >= horaObjetivo && entradaTime < horaObjetivoFin;
      const salioEnEstaHora =
        salidaTime && salidaTime >= horaObjetivo && salidaTime < horaObjetivoFin;
      const activoEnEstaHora =
        entradaTime <= horaObjetivo && (!salidaTime || salidaTime > horaObjetivo);

      if (entroEnEstaHora && salioEnEstaHora) {
        return "entrada-salida";
      } else if (entroEnEstaHora) {
        return "entrada";
      } else if (salioEnEstaHora) {
        return "salida";
      } else if (activoEnEstaHora) {
        return "activo";
      }

      return "inactivo";
    } catch (error) {
      console.log("Error al determinar estado del guardia:", error);
      return "inactivo";
    }
  }

  // Función para filtrar guardias que estuvieron activos durante el período consultado
  static getGuardsActiveInPeriod(guards, periodo) {
    if (!guards || !Array.isArray(guards)) return [];

    const now = new Date();
    let fechaInicio;

    if (periodo === "24horas") {
      fechaInicio = new Date(now);
      fechaInicio.setHours(now.getHours() - 24);
    } else if (periodo === "semana") {
      fechaInicio = new Date(now);
      fechaInicio.setDate(now.getDate() - 7);
      fechaInicio.setHours(0, 0, 0, 0);
    }

    return guards.filter((guard) => {
      if (!guard.entrada) return false;

      try {
        const entradaTime = new Date(guard.entrada);
        const salidaTime = guard.salida ? new Date(guard.salida) : null;

        // El guardia estuvo activo en el período si:
        // 1. Entró antes del final del período Y
        // 2. Salió después del inicio del período O no tiene salida registrada
        const entroAntesDelFin = entradaTime <= now;
        const salioDespuesDelInicio = !salidaTime || salidaTime >= fechaInicio;

        return entroAntesDelFin && salioDespuesDelInicio;
      } catch (error) {
        console.log("Error al procesar fecha del guardia:", error);
        return false;
      }
    });
  }

  // Encontrar reporte para una hora específica
  static findReportForHour(reportes, horaEsperada) {
    if (!reportes || !Array.isArray(reportes)) return null;

    return reportes.find((reporte) => {
      if (!reporte.createdAt) return false;

      try {
        const reportHour = new Date(reporte.createdAt);
        const expectedHour = new Date(horaEsperada.fechaCompleta);

        return (
          reportHour.getHours() === expectedHour.getHours() &&
          reportHour.getDate() === expectedHour.getDate() &&
          reportHour.getMonth() === expectedHour.getMonth() &&
          reportHour.getFullYear() === expectedHour.getFullYear()
        );
      } catch (error) {
        console.log("Error al procesar fecha del reporte:", error);
        return false;
      }
    });
  }

  // Determinar el estado del reporte
  static getReportStatus(reporte, horaEsperada) {
    if (!reporte) return "sin reporte";

    try {
      const horaReporte = new Date(reporte.createdAt);
      const horaEsperadaDate = new Date(horaEsperada.fechaCompleta);

      const diferencia = horaReporte - horaEsperadaDate;
      const diferenciaMinutos = diferencia / (1000 * 60);

      if (diferenciaMinutos > 21) {
        return "Atrasado";
      }

      return "A tiempo";
    } catch (error) {
      console.log("Error al determinar estado del reporte:", error);
      return "sin reporte";
    }
  }

  // Verificar si hay guardia activo para una hora específica
  static hasActiveGuardAtTime(guards, horaEsperada) {
    return this.getActiveGuardsAtTime(guards, horaEsperada).length > 0;
  }

  // Generar contenido HTML para una ubicación específica con período personalizado
  static generateLocationPdfContent(location, guards, reportes, periodo = "24horas") {
    const now = new Date();
    const fechaGeneracion = this.formatDateTime(now);

    let horas = [];
    let tituloPeriodo = "";

    if (periodo === "24horas") {
      horas = this.generateLast24Hours();
      tituloPeriodo = "Últimas 24 horas";
    } else if (periodo === "semana") {
      horas = this.generateLast7DaysWithHours();
      tituloPeriodo = "Última semana (7 días) - Desde 00:00 hasta hora actual";
    }

    // Filtrar horas futuras
    const horasFiltradas = horas.filter((hora) => {
      return new Date(hora.fechaCompleta) <= now;
    });

    // Filtrar guardias que estuvieron activos durante el período
    const guardsActivosEnPeriodo = this.getGuardsActiveInPeriod(guards, periodo);

    // Calcular estadísticas
    const totalReportes = horasFiltradas.filter((hora) => {
      return this.findReportForHour(reportes, hora);
    }).length;

    const porcentajeReportes =
      horasFiltradas.length > 0 ? Math.round((totalReportes / horasFiltradas.length) * 100) : 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: ${COLORS.text};
            font-size: 12px;
            line-height: 1.4;
            background-color: ${COLORS.background};
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid ${COLORS.primary};
            padding-bottom: 15px;
          }
          .title {
            color: ${COLORS.primary};
            font-size: 22px;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .subtitle {
            color: ${COLORS.textSecondary};
            font-size: 14px;
            margin-bottom: 4px;
          }
          .info-section {
            margin-bottom: 20px;
            background: ${COLORS.cardBackground};
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid ${COLORS.primary};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
            align-items: center;
          }
          .info-label {
            font-weight: bold;
            width: 200px;
            color: ${COLORS.primary};
          }
          .info-value {
            flex: 1;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .stat-card {
            background: ${COLORS.white};
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid ${COLORS.primary};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: ${COLORS.primary};
            margin-bottom: 5px;
          }
          .stat-label {
            font-size: 12px;
            color: ${COLORS.textSecondary};
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            background: ${COLORS.white};
          }
          .table th {
            background-color: ${COLORS.primary};
            color: ${COLORS.white};
            padding: 10px;
            text-align: left;
            border: 1px solid ${COLORS.primary};
            font-weight: bold;
            font-size: 10px;
          }
          .table td {
            padding: 8px;
            border: 1px solid ${COLORS.border};
            font-size: 9px;
            vertical-align: top;
          }
          .table tr:nth-child(even) {
            background-color: ${COLORS.lightGray};
          }
          .status-on-time { 
            background-color: ${COLORS.success}20; 
            color: ${COLORS.success}; 
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            text-align: center;
            border: 1px solid ${COLORS.success};
          }
          .status-late { 
            background-color: ${COLORS.error}20; 
            color: ${COLORS.error}; 
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            text-align: center;
            border: 1px solid ${COLORS.error};
          }
          .status-no-report { 
            background-color: ${COLORS.warning}20; 
            color: ${COLORS.warning}; 
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            text-align: center;
            border: 1px solid ${COLORS.warning};
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: ${COLORS.textSecondary};
            font-size: 10px;
            border-top: 1px solid ${COLORS.border};
            padding-top: 15px;
          }
          .guards-list {
            margin: 0;
            padding: 0;
          }
          .guard-item {
            margin-bottom: 3px;
            font-size: 8px;
            line-height: 1.2;
            padding: 2px 0;
            display: flex;
            align-items: center;
          }
          .guard-name {
            font-weight: bold;
            color: ${COLORS.primary};
            margin-right: 5px;
          }
          .guard-details {
            font-size: 7px;
            color: ${COLORS.textSecondary};
            margin-left: 5px;
          }
          .guard-status {
            font-size: 8px;
            margin-left: 3px;
            font-weight: bold;
          }
          .status-entrada {
            color: ${COLORS.success};
          }
          .status-salida {
            color: ${COLORS.error};
          }
          .status-entrada-salida {
            color: ${COLORS.warning};
          }
          .status-activo {
            color: ${COLORS.info};
          }
          .day-separator {
            background-color: ${COLORS.lightGray};
            font-weight: bold;
            padding: 8px;
            border-left: 4px solid ${COLORS.primary};
            font-size: 11px;
          }
          .no-guards {
            font-style: italic;
            color: ${COLORS.gray};
            font-size: 9px;
            text-align: center;
          }
          .section-title {
            color: ${COLORS.primary};
            font-size: 16px;
            font-weight: bold;
            margin: 25px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid ${COLORS.border};
          }
          .status-active {
            color: ${COLORS.success};
            font-weight: bold;
            font-style: italic;
          }
          .duration {
            font-weight: bold;
            color: ${COLORS.primary};
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Historial de Reportes</h1>
          <div class="subtitle">Ubicación: ${location}</div>
          <div class="subtitle">Período: ${tituloPeriodo}</div>
          <div class="subtitle">Generado: ${fechaGeneracion}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${guardsActivosEnPeriodo.length}</div>
            <div class="stat-label">Guardias Activos en el Período</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${horasFiltradas.length}</div>
            <div class="stat-label">Horas Analizadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totalReportes}</div>
            <div class="stat-label">Reportes Realizados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${porcentajeReportes}%</div>
            <div class="stat-label">Tasa de Completitud</div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">Ubicación:</div>
            <div class="info-value">${location}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Período Analizado:</div>
            <div class="info-value">${tituloPeriodo}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Fecha de Generación:</div>
            <div class="info-value">${fechaGeneracion}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Guardias en el período:</div>
            <div class="info-value">${guardsActivosEnPeriodo.length} guardia${guardsActivosEnPeriodo.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        <div class="section-title">Guardias Activos en el Período - ${tituloPeriodo}</div>
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Hora de Entrada</th>
              <th>Hora de Salida</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            ${
              guardsActivosEnPeriodo.length > 0
                ? guardsActivosEnPeriodo
                    .map((guard) => {
                      const entradaFormateada = this.formatDateTime(guard.entrada);
                      const salidaFormateada = guard.salida
                        ? this.formatDateTime(guard.salida)
                        : '<span class="status-active">En Activo</span>';
                      const duracion = this.calculateDuration(guard.entrada, guard.salida);

                      return `
                        <tr>
                          <td>${guard.nombre || "N/A"}</td>
                          <td>${entradaFormateada}</td>
                          <td>${salidaFormateada}</td>
                          <td class="duration">${duracion}</td>
                        </tr>
                      `;
                    })
                    .join("")
                : '<tr><td colspan="4" style="text-align: center; padding: 15px;">No hay guardias activos en este período</td></tr>'
            }
          </tbody>
        </table>

        <div class="section-title">Reportes por Hora - ${tituloPeriodo}</div>
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora Esperada</th>
              <th>Hora Reporte</th>
              <th>Guardias Activos</th>
              <th>Detalles de Guardias</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${horasFiltradas
              .map((hora, index) => {
                // Encontrar reporte para esta hora
                const reporte = this.findReportForHour(reportes, hora);

                // Determinar estado
                const estado = this.getReportStatus(reporte, hora);

                // Obtener guardias activos en ese momento
                const activeGuards = this.getActiveGuardsAtTime(guards, hora);

                // Separador de día para el período semanal
                const diaAnterior =
                  index > 0 ? new Date(horasFiltradas[index - 1].fechaCompleta).getDate() : null;
                const diaActual = new Date(hora.fechaCompleta).getDate();
                const mostrarSeparador = periodo === "semana" && diaAnterior !== diaActual;

                return `
                  ${mostrarSeparador ? `<tr class="day-separator"><td colspan="6"><strong>Día: ${hora.fecha}</strong></td></tr>` : ""}
                  <tr>
                    <td>${hora.fecha}</td>
                    <td><strong>${hora.hora}</strong></td>
                    <td>${reporte ? this.formatDateTime(reporte.createdAt) : "No reportado"}</td>
                    <td style="text-align: center;">${activeGuards.length}</td>
                    <td>
                      ${
                        activeGuards.length > 0
                          ? `<div class="guards-list">${activeGuards
                              .map((guard) => {
                                const estadoGuardia = this.getGuardStatusAtTime(guard, hora);
                                let flecha = "";

                                if (estadoGuardia === "entrada") {
                                  flecha = "→"; // Entró en esta hora
                                } else if (estadoGuardia === "salida") {
                                  flecha = "←"; // Salió en esta hora
                                } else if (estadoGuardia === "entrada-salida") {
                                  flecha = "↔"; // Entró y salió en esta hora
                                } else if (estadoGuardia === "activo") {
                                  flecha = "●"; // Activo durante toda la hora
                                }

                                return `
                                    <div class="guard-item">
                                      <span class="guard-name">${guard.nombre || "N/A"}</span>
                                      <span class="guard-status status-${estadoGuardia}">${flecha}</span>
                                      <span class="guard-details">
                                        Entrada: ${this.formatDate(guard.entrada)}, ${this.formatTime(guard.entrada)}
                                        ${guard.salida ? ` | Salida: ${this.formatDate(guard.salida)}, ${this.formatTime(guard.salida)}` : ""}
                                      </span>
                                    </div>`;
                              })
                              .join("")}</div>`
                          : '<div class="no-guards">Sin guardias activos</div>'
                      }
                    </td>
                    <td class="${
                      estado === "A tiempo"
                        ? "status-on-time"
                        : estado === "Atrasado"
                          ? "status-late"
                          : "status-no-report"
                    }">
                      ${estado}
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Sistema de Reportes de Guardias - Generado automáticamente</p>
          <p>© ${now.getFullYear()} - Todos los derechos reservados</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generar contenido HTML para todas las ubicaciones
  static generateAllLocationsPdfContent(groupedGuards, reportesData, periodo = "24horas") {
    const now = new Date();
    const fechaGeneracion = this.formatDateTime(now);

    let tituloPeriodo = "";
    if (periodo === "24horas") {
      tituloPeriodo = "Últimas 24 horas";
    } else if (periodo === "semana") {
      tituloPeriodo = "Última semana (7 días) - Desde 00:00 hasta hora actual";
    }

    // Calcular estadísticas generales
    let totalGuardiasEnPeriodo = 0;
    const groupedGuardsEnPeriodo = {};

    // Filtrar guardias por período para cada ubicación
    Object.entries(groupedGuards).forEach(([location, guards]) => {
      const guardsEnPeriodo = this.getGuardsActiveInPeriod(guards, periodo);
      groupedGuardsEnPeriodo[location] = guardsEnPeriodo;
      totalGuardiasEnPeriodo += guardsEnPeriodo.length;
    });

    const totalUbicaciones = Object.keys(groupedGuardsEnPeriodo).length;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: ${COLORS.text};
            font-size: 12px;
            line-height: 1.4;
            background-color: ${COLORS.background};
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid ${COLORS.primary};
            padding-bottom: 15px;
          }
          .title {
            color: ${COLORS.primary};
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .subtitle {
            color: ${COLORS.textSecondary};
            font-size: 14px;
            margin-bottom: 4px;
          }
          .summary-section {
            margin-bottom: 25px;
            background: ${COLORS.lightGray};
            padding: 20px;
            border-radius: 8px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .summary-item {
            background: ${COLORS.white};
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid ${COLORS.primary};
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: ${COLORS.primary};
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 12px;
            color: ${COLORS.textSecondary};
          }
          .location-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .location-title {
            background-color: ${COLORS.primary};
            color: ${COLORS.white};
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: bold;
          }
          .guards-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            background: ${COLORS.white};
          }
          .guards-table th {
            background-color: ${COLORS.primary};
            color: ${COLORS.white};
            padding: 8px;
            text-align: left;
            border: 1px solid ${COLORS.primary};
            font-weight: bold;
            font-size: 9px;
          }
          .guards-table td {
            padding: 6px;
            border: 1px solid ${COLORS.border};
            font-size: 8px;
          }
          .guards-table tr:nth-child(even) {
            background-color: ${COLORS.lightGray};
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 9px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            background: ${COLORS.white};
          }
          .table th {
            background-color: ${COLORS.primary};
            color: ${COLORS.white};
            padding: 8px;
            text-align: left;
            border: 1px solid ${COLORS.primary};
            font-weight: bold;
            font-size: 9px;
          }
          .table td {
            padding: 6px;
            border: 1px solid ${COLORS.border};
            font-size: 8px;
            vertical-align: top;
          }
          .table tr:nth-child(even) {
            background-color: ${COLORS.lightGray};
          }
          .status-on-time { 
            background-color: ${COLORS.success}20; 
            color: ${COLORS.success}; 
            font-weight: bold;
            padding: 3px 6px;
            border-radius: 3px;
            text-align: center;
            font-size: 8px;
            border: 1px solid ${COLORS.success};
          }
          .status-late { 
            background-color: ${COLORS.error}20; 
            color: ${COLORS.error}; 
            font-weight: bold;
            padding: 3px 6px;
            border-radius: 3px;
            text-align: center;
            font-size: 8px;
            border: 1px solid ${COLORS.error};
          }
          .status-no-report { 
            background-color: ${COLORS.warning}20; 
            color: ${COLORS.warning}; 
            font-weight: bold;
            padding: 3px 6px;
            border-radius: 3px;
            text-align: center;
            font-size: 8px;
            border: 1px solid ${COLORS.warning};
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: ${COLORS.textSecondary};
            font-size: 10px;
            border-top: 1px solid ${COLORS.border};
            padding-top: 15px;
          }
          .guards-list {
            margin: 0;
            padding: 0;
          }
          .guard-item {
            margin-bottom: 2px;
            font-size: 7px;
            line-height: 1.2;
            display: flex;
            align-items: center;
          }
          .guard-name {
            font-weight: bold;
            color: ${COLORS.primary};
            margin-right: 3px;
          }
          .guard-details {
            font-size: 6px;
            color: ${COLORS.textSecondary};
            margin-left: 3px;
          }
          .guard-status {
            font-size: 7px;
            margin-left: 2px;
            font-weight: bold;
          }
          .status-entrada {
            color: ${COLORS.success};
          }
          .status-salida {
            color: ${COLORS.error};
          }
          .status-entrada-salida {
            color: ${COLORS.warning};
          }
          .status-activo {
            color: ${COLORS.info};
          }
          .no-guards {
            font-style: italic;
            color: ${COLORS.gray};
            font-size: 7px;
            text-align: center;
          }
          .status-active {
            color: ${COLORS.success};
            font-weight: bold;
            font-style: italic;
          }
          .duration {
            font-weight: bold;
            color: ${COLORS.primary};
            text-align: center;
            font-size: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Reporte General de Guardias</h1>
          <div class="subtitle">Período: ${tituloPeriodo}</div>
          <div class="subtitle">Generado: ${fechaGeneracion}</div>
        </div>

        <div class="summary-section">
          <h3 style="margin: 0 0 15px 0; color: ${COLORS.primary};">Resumen General</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${totalUbicaciones}</div>
              <div class="summary-label">Total Ubicaciones</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalGuardiasEnPeriodo}</div>
              <div class="summary-label">Guardias en el Período</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${tituloPeriodo}</div>
              <div class="summary-label">Período Analizado</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${fechaGeneracion}</div>
              <div class="summary-label">Fecha de Generación</div>
            </div>
          </div>
        </div>

        ${Object.entries(groupedGuardsEnPeriodo)
          .map(([location, guards]) => {
            const reportes = reportesData[location] || [];
            const guardsEnPeriodo = guards;

            return `
              <div class="location-section">
                <div class="location-title">Ubicación: ${location}</div>
                
                <h4 style="margin: 15px 0 10px 0; color: ${COLORS.primary};">Guardias Activos en el Período</h4>
                <table class="guards-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Hora de Entrada</th>
                      <th>Hora de Salida</th>
                      <th>Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      guardsEnPeriodo.length > 0
                        ? guardsEnPeriodo
                            .map((guard) => {
                              const entradaFormateada = this.formatDateTime(guard.entrada);
                              const salidaFormateada = guard.salida
                                ? this.formatDateTime(guard.salida)
                                : '<span class="status-active">En Activo</span>';
                              const duracion = this.calculateDuration(guard.entrada, guard.salida);

                              return `
                                <tr>
                                  <td>${guard.nombre || "N/A"}</td>
                                  <td>${entradaFormateada}</td>
                                  <td>${salidaFormateada}</td>
                                  <td class="duration">${duracion}</td>
                                </tr>
                              `;
                            })
                            .join("")
                        : '<tr><td colspan="4" style="text-align: center; padding: 10px;">No hay guardias activos en este período</td></tr>'
                    }
                  </tbody>
                </table>

                <h4 style="margin: 20px 0 10px 0; color: ${COLORS.primary};">Resumen de Reportes</h4>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora Esperada</th>
                      <th>Hora Reporte</th>
                      <th>Guardias Activos</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(() => {
                      let horas = [];
                      if (periodo === "24horas") {
                        horas = this.generateLast24Hours();
                      } else if (periodo === "semana") {
                        horas = this.generateLast7DaysWithHours();
                      }

                      const horasFiltradas = horas.filter((hora) => {
                        return new Date(hora.fechaCompleta) <= now;
                      });

                      return horasFiltradas
                        .map((hora) => {
                          const reporte = this.findReportForHour(reportes, hora);
                          const estado = this.getReportStatus(reporte, hora);
                          const activeGuards = this.getActiveGuardsAtTime(guards, hora);

                          return `
                            <tr>
                              <td>${hora.fecha}</td>
                              <td><strong>${hora.hora}</strong></td>
                              <td>${reporte ? this.formatDateTime(reporte.createdAt) : "No reportado"}</td>
                              <td style="text-align: center;">${activeGuards.length}</td>
                              <td class="${
                                estado === "A tiempo"
                                  ? "status-on-time"
                                  : estado === "Atrasado"
                                    ? "status-late"
                                    : "status-no-report"
                              }">
                                ${estado}
                              </td>
                            </tr>
                          `;
                        })
                        .join("");
                    })()}
                  </tbody>
                </table>
              </div>
            `;
          })
          .join("")}

        <div class="footer">
          <p>Sistema de Reportes de Guardias - Generado automáticamente</p>
          <p>© ${now.getFullYear()} - Todos los derechos reservados</p>
        </div>
      </body>
      </html>
    `;
  }

  // Método principal para generar y compartir PDF
  static async generateAndSharePdf(htmlContent, fileName, shareTitle) {
    try {
      // Asegurarnos de que el fileName tenga la extensión .pdf
      if (!fileName.endsWith(".pdf")) {
        fileName = `${fileName}.pdf`;
      }

      console.log("Generando PDF...");
      console.log("FileName:", fileName);
      console.log("ShareTitle:", shareTitle);

      // Generar el PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      console.log("PDF generado temporalmente en:", uri);

      // Mover el archivo a la ubicación deseada
      const pdfUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });

      console.log("PDF movido a:", pdfUri);

      // Compartir el PDF
      if (await Sharing.isAvailableAsync()) {
        console.log("Compartiendo PDF...");
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: shareTitle,
          UTI: "com.adobe.pdf", // Especificar el tipo UTI para iOS
        });
        console.log("PDF compartido exitosamente");
      } else {
        console.log("Sharing not available on this platform");
      }

      return pdfUri;
    } catch (error) {
      console.log("Error generating PDF:", error);
      throw error;
    }
  }
  // Método para generar PDF de todas las ubicaciones
  static async generateAllLocationsPdf(groupedGuards, reportesData, periodo = "24horas") {
    try {
      const htmlContent = this.generateAllLocationsPdfContent(groupedGuards, reportesData, periodo);

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const fileName = `Reporte_General_${new Date().toISOString().split("T")[0]}.pdf`;

      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: "Reporte General de Guardias",
        });
      } else {
        console.log("Sharing not available");
      }

      return newUri;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }
}
