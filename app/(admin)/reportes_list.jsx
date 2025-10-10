// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   ScrollView,
//   Modal,
//   Image,
// } from "react-native";
// import { useAuthStore } from "../../store/authStore";
// import { useEffect, useState } from "react";
// import styles from "../../assets/styles/reportes_list.styles";
// import { API_URL } from "../../constants/api";
// import { Ionicons } from "@expo/vector-icons";
// import COLORS from "../../constants/colors";
// import Loader from "../../components/Loader";
// import { useRouter } from "expo-router";
// import LocationSelector from "../../components/LocationSelector";
// import { PdfGenerator } from "../../components/PdfGenerator";
// import DownloadPdfButton from "../../components/DownloadPdfButton";

// export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// export default function GuardiasActivos() {
//   const { token, user } = useAuthStore();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState("Todos");
//   const [allEntradas, setAllEntradas] = useState([]);
//   const [filteredActiveGuards, setFilteredActiveGuards] = useState([]);
//   const [reportesData, setReportesData] = useState({});
//   const [expandedLocations, setExpandedLocations] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [selectedHourData, setSelectedHourData] = useState(null);
//   const [downloadingPdf, setDownloadingPdf] = useState(false);
//   const [periodoPdf, setPeriodoPdf] = useState("24horas");
//   const [periodoModalVisible, setPeriodoModalVisible] = useState(false);
//   const [downloadAction, setDownloadAction] = useState(null); // 'location' o 'all'
//   const [allLocations, setAllLocations] = useState([]); // Nuevo estado para todas las ubicaciones

//   // Función para obtener TODAS las ubicaciones disponibles - OPTIMIZADA
//   const fetchAllLocations = async () => {
//     try {
//       const response = await fetch(`${API_URL}/auth/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch users");
//       }

//       const usersData = await response.json();

//       // Filtrar solo usuarios no admin (ubicaciones)
//       const nonAdminUsers = usersData.filter((user) => user.admin === "invalido");

//       // Formatear como array de ubicaciones
//       const locations = nonAdminUsers.map((user) => ({
//         nombre: user.username,
//         userId: user._id,
//         numero_guardias: user.numero_guardias,
//         profileImage: user.profileImage,
//       }));

//       setAllLocations(locations);
//     } catch (error) {
//       console.log("Error fetching locations from users:", error);
//       // Fallback: usar ubicaciones de entradas
//       const locationsFromEntradas = [...new Set(allEntradas.map((entrada) => entrada.locacion))];
//       setAllLocations(locationsFromEntradas.map((name) => ({ nombre: name })));
//     }
//   };

//   // Función para obtener TODAS las entradas (no solo activas)
//   const fetchAllEntradas = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(`${API_URL}/entrada?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch entradas");
//       }

//       const data = await response.json();
//       setAllEntradas(data.entradas || []);
//       applyLocationFilter(data.entradas || [], selectedLocation);

//       await fetchReportesForLocations(data.entradas || []);
//     } catch (error) {
//       console.log("Error fetching entradas:", error);
//       Alert.alert("Error", "No se pudieron cargar los datos de guardias");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Obtener reportes para cada ubicación única - OPTIMIZADA
//   const fetchReportesForLocations = async (entradas) => {
//     // Obtener ubicaciones de los usuarios no admin
//     const locationsFromUsers = allLocations.map((loc) => loc.nombre);
//     const locationsFromEntradas = [...new Set(entradas.map((entrada) => entrada.locacion))];

//     // Combinar ambas fuentes y eliminar duplicados
//     const allAvailableLocations = [...new Set([...locationsFromEntradas, ...locationsFromUsers])];

//     const reportesPorUbicacion = {};

//     for (const location of allAvailableLocations) {
//       try {
//         const response = await fetch(`${API_URL}/reporte/ubicacion/${location}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.ok) {
//           const reportes = await response.json();
//           reportesPorUbicacion[location] = reportes;
//         } else {
//           reportesPorUbicacion[location] = [];
//         }
//       } catch (error) {
//         console.log(`Error fetching reports for ${location}:`, error);
//         reportesPorUbicacion[location] = [];
//       }
//     }

//     setReportesData(reportesPorUbicacion);
//   };

//   // Generar las últimas 12 horas (para la vista normal)
//   const generateLast12Hours = () => {
//     const hours = [];
//     const now = new Date();

//     for (let i = 0; i < 12; i++) {
//       const hour = new Date(now);
//       hour.setHours(now.getHours() - i);
//       const hourString = `${hour.getHours().toString().padStart(2, "0")}:00`;
//       const dateString = hour.toLocaleDateString("es-ES");

//       hours.unshift({
//         hora: hourString,
//         fecha: dateString,
//         fechaCompleta: hour,
//         timestamp: hour.getTime(),
//         key: `${dateString}_${hourString}`,
//       });
//     }

//     return hours;
//   };

//   // Determinar el estado del reporte
//   const getReportStatus = (reporte, horaEsperada) => {
//     if (!reporte) return "sin reporte";

//     const horaReporte = new Date(reporte.createdAt);
//     const horaEsperadaDate = new Date(horaEsperada.fechaCompleta);

//     const diferencia = horaReporte - horaEsperadaDate;
//     const diferenciaMinutos = diferencia / (1000 * 60);

//     if (diferenciaMinutos > 15) {
//       return "Atrasado";
//     }

//     return "A tiempo";
//   };

//   // Obtener guardias activos en una hora específica - CORREGIDO
//   const getActiveGuardsAtTime = (location, horaEsperada) => {
//     if (!location) return [];

//     const horaObjetivo = new Date(horaEsperada.fechaCompleta);
//     const horaObjetivoFin = new Date(horaObjetivo);
//     horaObjetivoFin.setHours(horaObjetivo.getHours() + 1, 0, 0, 0);

//     return allEntradas.filter((entrada) => {
//       // Verificar ubicación
//       if (entrada.locacion !== location) return false;

//       const entradaTime = new Date(entrada.entrada);
//       const salidaTime = entrada.salida ? new Date(entrada.salida) : null;

//       // El guardia está activo si:
//       // 1. Entró antes del FIN de la hora objetivo Y
//       // 2. (No tiene salida registrada O salió después del INICIO de la hora objetivo)
//       const entroAntesDelFin = entradaTime < horaObjetivoFin;
//       const salioDespuesDelInicio = !salidaTime || salidaTime > horaObjetivo;

//       return entroAntesDelFin && salioDespuesDelInicio;
//     });
//   };

//   // Función para determinar el estado del guardia en una hora específica
//   const getGuardStatusAtTime = (guard, horaEsperada) => {
//     if (!guard.entrada) return "inactivo";

//     const entradaTime = new Date(guard.entrada);
//     const salidaTime = guard.salida ? new Date(guard.salida) : null;
//     const horaObjetivo = new Date(horaEsperada.fechaCompleta);
//     const horaObjetivoFin = new Date(horaObjetivo);
//     horaObjetivoFin.setHours(horaObjetivo.getHours() + 1, 0, 0, 0);

//     const entroEnEstaHora = entradaTime >= horaObjetivo && entradaTime < horaObjetivoFin;
//     const salioEnEstaHora =
//       salidaTime && salidaTime >= horaObjetivo && salidaTime < horaObjetivoFin;
//     const activoEnEstaHora =
//       entradaTime <= horaObjetivo && (!salidaTime || salidaTime > horaObjetivo);

//     if (entroEnEstaHora && salioEnEstaHora) {
//       return "entrada-salida";
//     } else if (entroEnEstaHora) {
//       return "entrada";
//     } else if (salioEnEstaHora) {
//       return "salida";
//     } else if (activoEnEstaHora) {
//       return "activo";
//     }

//     return "inactivo";
//   };

//   // Verificar si hay guardia activo para una hora específica - CORREGIDO
//   const hasActiveGuardAtTime = (location, horaEsperada) => {
//     return getActiveGuardsAtTime(location, horaEsperada).length > 0;
//   };

//   // Encontrar reporte para una hora específica
//   const findReportForHour = (reportes, horaEsperada) => {
//     return reportes.find((reporte) => {
//       const reportHour = new Date(reporte.createdAt);
//       const expectedHour = new Date(horaEsperada.fechaCompleta);

//       return (
//         reportHour.getHours() === expectedHour.getHours() &&
//         reportHour.getDate() === expectedHour.getDate() &&
//         reportHour.getMonth() === expectedHour.getMonth() &&
//         reportHour.getFullYear() === expectedHour.getFullYear()
//       );
//     });
//   };

//   // Toggle para expandir/contraer ubicación
//   const toggleLocation = (location) => {
//     setExpandedLocations((prev) => ({
//       ...prev,
//       [location]: !prev[location],
//     }));
//   };

//   // Abrir modal con detalles del reporte - ACTUALIZADO
//   const openReportDetails = (reporte, horaData, location) => {
//     const activeGuards = getActiveGuardsAtTime(location, horaData);
//     setSelectedReport(reporte);
//     setSelectedHourData({
//       ...horaData,
//       location,
//       activeGuards,
//     });
//     setModalVisible(true);
//   };

//   // Cerrar modal
//   const closeModal = () => {
//     setModalVisible(false);
//     setSelectedReport(null);
//     setSelectedHourData(null);
//   };

//   // Aplicar filtro de ubicación - MODIFICADO para incluir ubicaciones sin guardias
//   const applyLocationFilter = (entradas, location) => {
//     if (location === "Todos") {
//       setFilteredActiveGuards(entradas);
//     } else {
//       const filtered = entradas.filter((entrada) => entrada.locacion === location);
//       setFilteredActiveGuards(filtered);
//     }
//   };

//   // Agrupar entradas por ubicación - MODIFICADO para incluir ubicaciones sin guardias
//   const groupEntradasByLocation = (entradas) => {
//     const grouped = {};

//     // Primero agregamos todas las ubicaciones disponibles (incluso sin guardias)
//     allLocations.forEach((locationObj) => {
//       const locationName = locationObj.nombre;
//       grouped[locationName] = entradas.filter((entrada) => entrada.locacion === locationName);
//     });

//     return grouped;
//   };

//   // Obtener todas las ubicaciones únicas (incluyendo las de entradas y todas las disponibles)
//   const getAllUniqueLocations = () => {
//     const locationsFromEntradas = [...new Set(allEntradas.map((entrada) => entrada.locacion))];
//     const allLocationNames = allLocations.map((loc) => loc.nombre);
//     const allAvailableLocations = [...new Set([...locationsFromEntradas, ...allLocationNames])];
//     return allAvailableLocations;
//   };

//   // Helper functions para pasar al PDF Generator
//   const pdfHelpers = {
//     generateLast12Hours,
//     findReportForHour,
//     getReportStatus,
//     getActiveGuardsAtTime,
//     hasActiveGuardAtTime,
//     getGuardStatusAtTime,
//   };

//   // Función para mostrar modal de selección de período
//   const showPeriodoModal = (action, location = null) => {
//     setDownloadAction({ type: action, location });
//     setPeriodoModalVisible(true);
//   };

//   // Función para descargar PDF después de seleccionar período
//   const handleDownloadWithPeriodo = async () => {
//     setPeriodoModalVisible(false);

//     if (!downloadAction) return;

//     try {
//       setDownloadingPdf(true);

//       if (downloadAction.type === "location" && downloadAction.location) {
//         // Descargar PDF de ubicación específica
//         const entradasEnUbicacion = allEntradas.filter(
//           (entrada) => entrada.locacion === downloadAction.location
//         );
//         const reportesUbicacion = reportesData[downloadAction.location] || [];

//         // PERMITIR descargar incluso si no hay guardias, para mostrar ubicaciones vacías
//         const htmlContent = PdfGenerator.generateLocationPdfContent(
//           downloadAction.location,
//           entradasEnUbicacion,
//           reportesUbicacion,
//           periodoPdf,
//           pdfHelpers
//         );

//         const periodoTexto = periodoPdf === "24horas" ? "24_horas" : "semana";
//         const fileName = `Historial_${downloadAction.location.replace(/\s+/g, "_")}_${periodoTexto}_${Date.now()}.pdf`;

//         await PdfGenerator.generateAndSharePdf(
//           htmlContent,
//           fileName,
//           `Descargar historial de ${downloadAction.location} - ${periodoTexto}`
//         );
//       } else if (downloadAction.type === "all") {
//         // Descargar PDF de todas las ubicaciones
//         const groupedEntradas = groupEntradasByLocation(allEntradas);

//         const htmlContent = PdfGenerator.generateAllLocationsPdfContent(
//           groupedEntradas,
//           reportesData,
//           periodoPdf,
//           pdfHelpers
//         );

//         const periodoTexto = periodoPdf === "24horas" ? "24_horas" : "semana";
//         const fileName = `Reporte_General_${periodoTexto}_${Date.now()}.pdf`;

//         await PdfGenerator.generateAndSharePdf(
//           htmlContent,
//           fileName,
//           `Descargar reporte general - ${periodoTexto}`
//         );
//       }
//     } catch (error) {
//       console.log("Error al generar PDF:", error);
//       Alert.alert("Error", "No se pudo generar el PDF");
//     } finally {
//       setDownloadingPdf(false);
//       setDownloadAction(null);
//     }
//   };

//   // Componente para el modal de selección de período
//   const PeriodoModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={periodoModalVisible}
//       onRequestClose={() => setPeriodoModalVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.periodoModalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Seleccionar Período</Text>
//             <TouchableOpacity
//               onPress={() => setPeriodoModalVisible(false)}
//               style={styles.closeButton}
//             >
//               <Ionicons name="close" size={24} color={COLORS.text} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.periodoModalBody}>
//             <Text style={styles.periodoModalText}>Selecciona el período para el reporte:</Text>

//             <TouchableOpacity
//               style={[
//                 styles.periodoModalButton,
//                 periodoPdf === "24horas" && styles.periodoModalButtonActive,
//               ]}
//               onPress={() => setPeriodoPdf("24horas")}
//             >
//               <Ionicons
//                 name={periodoPdf === "24horas" ? "radio-button-on" : "radio-button-off"}
//                 size={20}
//                 color={periodoPdf === "24horas" ? COLORS.primary : COLORS.textSecondary}
//               />
//               <Text
//                 style={[
//                   styles.periodoModalButtonText,
//                   periodoPdf === "24horas" && styles.periodoModalButtonTextActive,
//                 ]}
//               >
//                 Últimas 24 horas
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.periodoModalButton,
//                 periodoPdf === "semana" && styles.periodoModalButtonActive,
//               ]}
//               onPress={() => setPeriodoPdf("semana")}
//             >
//               <Ionicons
//                 name={periodoPdf === "semana" ? "radio-button-on" : "radio-button-off"}
//                 size={20}
//                 color={periodoPdf === "semana" ? COLORS.primary : COLORS.textSecondary}
//               />
//               <Text
//                 style={[
//                   styles.periodoModalButtonText,
//                   periodoPdf === "semana" && styles.periodoModalButtonTextActive,
//                 ]}
//               >
//                 Última semana (00:00 - actual)
//               </Text>
//             </TouchableOpacity>

//             <View style={styles.periodoModalActions}>
//               <TouchableOpacity
//                 style={styles.periodoModalCancel}
//                 onPress={() => setPeriodoModalVisible(false)}
//               >
//                 <Text style={styles.periodoModalCancelText}>Cancelar</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.periodoModalConfirm}
//                 onPress={handleDownloadWithPeriodo}
//               >
//                 <Text style={styles.periodoModalConfirmText}>
//                   {downloadingPdf ? "Generando..." : "Descargar"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   // Componente para el header de ubicación con botón de descarga - MEJORADO
//   const LocationHeaderWithDownload = ({ location, entradas, isExpanded, onToggle }) => {
//     // VERIFICAR SI HAY GUARDIAS ACTIVOS EN ESTE MOMENTO, no si alguna vez tuvo guardias
//     const guardiasActivosAhora = getActiveGuardsAtTime(location, { fechaCompleta: new Date() });
//     const tieneGuardiasActivos = guardiasActivosAhora.length > 0;

//     // Encontrar la información completa de la ubicación
//     const locationInfo = allLocations.find((loc) => loc.nombre === location);

//     return (
//       <TouchableOpacity style={styles.locationHeader} onPress={onToggle} activeOpacity={0.7}>
//         <View style={styles.locationHeaderLeft}>
//           <Ionicons
//             name="location-outline"
//             size={20}
//             color={tieneGuardiasActivos ? COLORS.primary : COLORS.textSecondary}
//           />
//           <View>
//             <Text
//               style={[styles.locationTitle, !tieneGuardiasActivos && styles.locationWithoutGuards]}
//             >
//               {location}
//             </Text>
//             {locationInfo && (
//               <Text style={styles.locationSubtitle}>
//                 {locationInfo.numero_guardias} guardias asignados
//               </Text>
//             )}
//           </View>
//         </View>
//         <View style={styles.locationHeaderRight}>
//           <Text style={[styles.guardCount, !tieneGuardiasActivos && styles.guardCountZero]}>
//             ({guardiasActivosAhora.length} activo{guardiasActivosAhora.length !== 1 ? "s" : ""})
//           </Text>
//           <Ionicons
//             name={isExpanded ? "chevron-up" : "chevron-down"}
//             size={20}
//             color={tieneGuardiasActivos ? COLORS.primary : COLORS.textSecondary}
//           />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   useEffect(() => {
//     fetchAllEntradas();
//   }, []);

//   useEffect(() => {
//     if (allEntradas.length > 0) {
//       fetchAllLocations();
//     }
//   }, [allEntradas]);

//   useEffect(() => {
//     applyLocationFilter(allEntradas, selectedLocation);
//   }, [selectedLocation, allEntradas]);

//   useEffect(() => {
//     if (allLocations.length > 0) {
//       fetchReportesForLocations(allEntradas);
//     }
//   }, [allLocations, allEntradas]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchAllEntradas();
//     setRefreshing(false);
//   };

//   const handleLocationChange = (location) => {
//     setSelectedLocation(location);
//   };

//   const handleClearLocation = () => {
//     setSelectedLocation("Todos");
//   };

//   const formatTime = (date) => {
//     if (!date) return "No registrada";
//     return new Date(date).toLocaleTimeString("es-ES", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDate = (date) => {
//     if (!date) return "No registrada";
//     return new Date(date).toLocaleDateString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   // Componente para mostrar la lista de reportes por ubicación - COMPLETAMENTE CORREGIDO
//   const ReportesList = () => {
//     const allUniqueLocations = getAllUniqueLocations();

//     // Si hay filtro de ubicación específica, mostramos solo esa ubicación
//     const locationsToShow = selectedLocation !== "Todos" ? [selectedLocation] : allUniqueLocations;

//     if (locationsToShow.length === 0) {
//       return (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="shield-outline" size={60} color={COLORS.textSecondary} />
//           <Text style={styles.emptyText}>No hay ubicaciones disponibles</Text>
//           <Text style={styles.emptySubtext}>No se encontraron ubicaciones para mostrar</Text>
//         </View>
//       );
//     }

//     const groupedEntradas = groupEntradasByLocation(allEntradas);
//     const last12Hours = generateLast12Hours();
//     const last2Hours = last12Hours.slice(-2);

//     return (
//       <ScrollView style={styles.activeGuardsScroll} showsVerticalScrollIndicator={false}>
//         {/* Botón para descargar reporte general */}
//         {selectedLocation === "Todos" && (
//           <DownloadPdfButton
//             onPress={() => showPeriodoModal("all")}
//             downloading={downloadingPdf}
//             label={`Descargar Reporte General`}
//             variant="primary"
//           />
//         )}

//         {locationsToShow.map((location) => {
//           const entradas = groupedEntradas[location] || [];
//           const isExpanded = expandedLocations[location];
//           const hoursToShow = isExpanded ? last12Hours : last2Hours;

//           // VERIFICAR SI HAY GUARDIAS ACTIVOS EN ESTE MOMENTO, no si alguna vez tuvo guardias
//           const guardiasActivosAhora = getActiveGuardsAtTime(location, {
//             fechaCompleta: new Date(),
//           });
//           const tieneGuardiasActivos = guardiasActivosAhora.length > 0;

//           return (
//             <View
//               key={location}
//               style={[
//                 styles.locationGroup,
//                 !tieneGuardiasActivos && styles.locationGroupWithoutGuards,
//               ]}
//             >
//               <LocationHeaderWithDownload
//                 location={location}
//                 entradas={entradas}
//                 isExpanded={isExpanded}
//                 onToggle={() => toggleLocation(location)}
//               />

//               {/* Tabla de reportes - Mostrar incluso si no hay guardias activos */}
//               <View style={styles.reportesTable}>
//                 <View style={styles.tableHeader}>
//                   <Text style={styles.tableHeaderText}>Hora de Reporte</Text>
//                   <Text style={styles.tableHeaderText}>Hora</Text>
//                   <Text style={styles.tableHeaderText}>Guardias Activos</Text>
//                   <Text style={styles.tableHeaderText}>Estado</Text>
//                 </View>

//                 {hoursToShow.map((hora, index) => {
//                   const reportesUbicacion = reportesData[location] || [];
//                   const reporte = findReportForHour(reportesUbicacion, hora);
//                   const tieneGuardiaActivo = hasActiveGuardAtTime(location, hora);
//                   const estado = getReportStatus(reporte, hora);
//                   const activeGuards = getActiveGuardsAtTime(location, hora);

//                   return (
//                     <TouchableOpacity
//                       key={hora.key || hora.timestamp}
//                       style={[
//                         styles.tableRow,
//                         index % 2 === 0 && styles.tableRowEven,
//                         index === hoursToShow.length - 1 && styles.lastTableRow,
//                         !tieneGuardiasActivos && styles.tableRowWithoutGuards,
//                       ]}
//                       onPress={() =>
//                         tieneGuardiasActivos ? openReportDetails(reporte, hora, location) : null
//                       }
//                       activeOpacity={tieneGuardiasActivos ? 0.7 : 1}
//                       disabled={!tieneGuardiasActivos}
//                     >
//                       <Text
//                         style={[
//                           styles.tableCell,
//                           !tieneGuardiasActivos && styles.tableCellWithoutGuards,
//                         ]}
//                       >
//                         {reporte
//                           ? new Date(reporte.createdAt).toLocaleString("es-ES", {
//                               day: "2-digit",
//                               month: "2-digit",
//                               year: "numeric",
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })
//                           : tieneGuardiaActivo
//                             ? "No reportado"
//                             : "No activo"}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.tableCell,
//                           !tieneGuardiasActivos && styles.tableCellWithoutGuards,
//                         ]}
//                       >
//                         {hora.hora}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.tableCell,
//                           !tieneGuardiasActivos && styles.tableCellWithoutGuards,
//                         ]}
//                       >
//                         {activeGuards.length > 0
//                           ? `${activeGuards.length} guardia${activeGuards.length !== 1 ? "s" : ""}`
//                           : "Sin guardias"}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.tableCell,
//                           styles.statusCell,
//                           estado === "A tiempo" && styles.statusOnTime,
//                           estado === "Atrasado" && styles.statusLate,
//                           estado === "sin reporte" && styles.statusNoReport,
//                           !tieneGuardiasActivos && styles.statusNoGuards,
//                         ]}
//                       >
//                         {tieneGuardiasActivos ? estado : "Sin guardias"}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>

//               {/* Botón de descarga - MOSTRAR SIEMPRE, incluso para ubicaciones sin guardias activos */}
//               <DownloadPdfButton
//                 onPress={() => showPeriodoModal("location", location)}
//                 downloading={downloadingPdf}
//                 label={`Descargar ${location}`}
//                 // variant={tieneGuardiasActivos ? "primary" : "secondary"}
//               />
//             </View>
//           );
//         })}
//       </ScrollView>
//     );
//   };

//   // Modal de detalles del reporte
//   const ReportDetailsModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={modalVisible}
//       onRequestClose={closeModal}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Detalles del Reporte</Text>
//             <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
//               <Ionicons name="close" size={24} color={COLORS.text} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.modalBody}>
//             {selectedReport ? (
//               <>
//                 {/* Información de la hora */}
//                 <View style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>Información de la Hora</Text>
//                   <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Hora esperada:</Text>
//                     <Text style={styles.infoValue}>
//                       {selectedHourData?.hora} - {selectedHourData?.fecha}
//                     </Text>
//                   </View>
//                   <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Hora de reporte:</Text>
//                     <Text style={styles.infoValue}>
//                       {new Date(selectedReport.createdAt).toLocaleString("es-ES")}
//                     </Text>
//                   </View>
//                   <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Estado:</Text>
//                     <Text
//                       style={[
//                         styles.infoValue,
//                         styles.statusValue,
//                         getReportStatus(selectedReport, selectedHourData) === "A tiempo" &&
//                           styles.statusOnTime,
//                         getReportStatus(selectedReport, selectedHourData) === "Atrasado" &&
//                           styles.statusLate,
//                       ]}
//                     >
//                       {getReportStatus(selectedReport, selectedHourData)}
//                     </Text>
//                   </View>
//                 </View>

//                 {/* Guardia que hizo el reporte */}
//                 <View style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>Guardia que Reportó</Text>
//                   {selectedReport.guardias &&
//                     selectedReport.guardias.map((guardia, index) => (
//                       <View key={index} style={styles.guardiaReporte}>
//                         <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
//                         <View style={styles.guardiaInfo}>
//                           <Text style={styles.guardiaNombre}>{guardia}</Text>
//                           <Text style={styles.guardiaRol}>Reportó esta hora</Text>
//                         </View>
//                       </View>
//                     ))}
//                 </View>

//                 {/* Descripción */}
//                 {selectedReport.descripcion && (
//                   <View style={styles.modalSection}>
//                     <Text style={styles.modalSectionTitle}>Descripción del Reporte</Text>
//                     <Text style={styles.descriptionText}>{selectedReport.descripcion}</Text>
//                   </View>
//                 )}

//                 {/* Guardias activos en esa hora */}
//                 <View style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>
//                     Guardias Activos en ese Momento ({selectedHourData?.activeGuards?.length || 0})
//                   </Text>
//                   {selectedHourData?.activeGuards?.length > 0 ? (
//                     selectedHourData.activeGuards.map((guard, index) => {
//                       const estadoGuardia = getGuardStatusAtTime(guard, selectedHourData);
//                       let icono = "●";
//                       let color = COLORS.success;

//                       if (estadoGuardia === "entrada") {
//                         icono = "→";
//                         color = COLORS.success;
//                       } else if (estadoGuardia === "salida") {
//                         icono = "←";
//                         color = COLORS.error;
//                       } else if (estadoGuardia === "entrada-salida") {
//                         icono = "↔";
//                         color = COLORS.warning;
//                       } else if (estadoGuardia === "activo") {
//                         icono = "●";
//                         color = COLORS.info;
//                       }

//                       return (
//                         <View key={guard._id} style={styles.guardiaActiva}>
//                           <Text style={[styles.guardiaIcono, { color }]}>{icono}</Text>
//                           <View style={styles.guardiaInfo}>
//                             <Text style={styles.guardiaNombre}>{guard.nombre}</Text>
//                             <Text style={styles.guardiaDetalles}>
//                               Entrada: {formatDate(guard.entrada)} {formatTime(guard.entrada)}
//                               {guard.salida &&
//                                 ` • Salida: ${formatDate(guard.salida)} ${formatTime(guard.salida)}`}
//                             </Text>
//                           </View>
//                         </View>
//                       );
//                     })
//                   ) : (
//                     <Text style={styles.noGuardiasText}>
//                       No había guardias activos en ese momento
//                     </Text>
//                   )}
//                 </View>
//               </>
//             ) : (
//               // Cuando no hay reporte
//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Sin Reporte</Text>
//                 <View style={styles.infoRow}>
//                   <Text style={styles.infoLabel}>Hora:</Text>
//                   <Text style={styles.infoValue}>
//                     {selectedHourData?.hora} - {selectedHourData?.fecha}
//                   </Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                   <Text style={styles.infoLabel}>Estado:</Text>
//                   <Text style={[styles.infoValue, styles.statusValue, styles.statusNoReport]}>
//                     {hasActiveGuardAtTime(selectedHourData?.location, selectedHourData)
//                       ? "No reportado"
//                       : "No activo"}
//                   </Text>
//                 </View>

//                 {/* Guardias activos en esa hora */}
//                 <View style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>
//                     Guardias Activos en ese Momento ({selectedHourData?.activeGuards?.length || 0})
//                   </Text>
//                   {selectedHourData?.activeGuards?.length > 0 ? (
//                     selectedHourData.activeGuards.map((guard, index) => {
//                       const estadoGuardia = getGuardStatusAtTime(guard, selectedHourData);
//                       let icono = "●";
//                       let color = COLORS.success;

//                       if (estadoGuardia === "entrada") {
//                         icono = "→";
//                         color = COLORS.success;
//                       } else if (estadoGuardia === "salida") {
//                         icono = "←";
//                         color = COLORS.error;
//                       } else if (estadoGuardia === "entrada-salida") {
//                         icono = "↔";
//                         color = COLORS.warning;
//                       } else if (estadoGuardia === "activo") {
//                         icono = "●";
//                         color = COLORS.info;
//                       }

//                       return (
//                         <View key={guard._id} style={styles.guardiaActiva}>
//                           <Text style={[styles.guardiaIcono, { color }]}>{icono}</Text>
//                           <View style={styles.guardiaInfo}>
//                             <Text style={styles.guardiaNombre}>{guard.nombre}</Text>
//                             <Text style={styles.guardiaDetalles}>
//                               Entrada: {formatDate(guard.entrada)} {formatTime(guard.entrada)}
//                               {guard.salida &&
//                                 ` • Salida: ${formatDate(guard.salida)} ${formatTime(guard.salida)}`}
//                             </Text>
//                           </View>
//                         </View>
//                       );
//                     })
//                   ) : (
//                     <Text style={styles.noGuardiasText}>
//                       No había guardias activos en ese momento
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             )}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (loading) return <Loader />;

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={[]}
//         renderItem={null}
//         keyExtractor={() => "dummy"}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         ListHeaderComponent={
//           <View style={styles.header}>
//             <LocationSelector
//               selectedLocation={selectedLocation}
//               onLocationChange={handleLocationChange}
//               onClearLocation={handleClearLocation}
//               placeholder="Seleccionar ubicación"
//               label="Filtrar por ubicación:"
//             />
//           </View>
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             colors={[COLORS.primary]}
//             tintColor={COLORS.primary}
//           />
//         }
//         ListFooterComponent={<ReportesList />}
//       />

//       <ReportDetailsModal />
//       <PeriodoModal />
//     </View>
//   );
// }
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import styles from "../../assets/styles/reportes_list.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { useRouter } from "expo-router";
import LocationSelector from "../../components/LocationSelector";
import { PdfGenerator } from "../../components/PdfGenerator";
import DownloadPdfButton from "../../components/DownloadPdfButton";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function GuardiasActivos() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [allEntradas, setAllEntradas] = useState([]);
  const [filteredActiveGuards, setFilteredActiveGuards] = useState([]);
  const [reportesData, setReportesData] = useState({});
  const [expandedLocations, setExpandedLocations] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedHourData, setSelectedHourData] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [periodoPdf, setPeriodoPdf] = useState("24horas");
  const [periodoModalVisible, setPeriodoModalVisible] = useState(false);
  const [downloadAction, setDownloadAction] = useState(null); // 'location' o 'all'
  const [allLocations, setAllLocations] = useState([]); // Nuevo estado para todas las ubicaciones

  // Función para obtener TODAS las ubicaciones disponibles - OPTIMIZADA
  const fetchAllLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const usersData = await response.json();

      // Filtrar solo usuarios no admin (ubicaciones)
      const nonAdminUsers = usersData.filter((user) => user.admin === "invalido");

      // Formatear como array de ubicaciones
      const locations = nonAdminUsers.map((user) => ({
        nombre: user.username,
        userId: user._id,
        numero_guardias: user.numero_guardias,
        profileImage: user.profileImage,
      }));

      setAllLocations(locations);
    } catch (error) {
      console.log("Error fetching locations from users:", error);
      // Fallback: usar ubicaciones de entradas
      const locationsFromEntradas = [...new Set(allEntradas.map((entrada) => entrada.locacion))];
      setAllLocations(locationsFromEntradas.map((name) => ({ nombre: name })));
    }
  };

  // Función para obtener TODAS las entradas (no solo activas)
  const fetchAllEntradas = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/entrada?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch entradas");
      }

      const data = await response.json();
      setAllEntradas(data.entradas || []);
      applyLocationFilter(data.entradas || [], selectedLocation);

      await fetchReportesForLocations(data.entradas || []);
    } catch (error) {
      console.log("Error fetching entradas:", error);
      Alert.alert("Error", "No se pudieron cargar los datos de guardias");
    } finally {
      setLoading(false);
    }
  };

  // Obtener reportes para cada ubicación única - OPTIMIZADA
  const fetchReportesForLocations = async (entradas) => {
    // Obtener ubicaciones de los usuarios no admin
    const locationsFromUsers = allLocations.map((loc) => loc.nombre);
    const locationsFromEntradas = [...new Set(entradas.map((entrada) => entrada.locacion))];

    // Combinar ambas fuentes y eliminar duplicados
    const allAvailableLocations = [...new Set([...locationsFromEntradas, ...locationsFromUsers])];

    const reportesPorUbicacion = {};

    for (const location of allAvailableLocations) {
      try {
        const response = await fetch(`${API_URL}/reporte/ubicacion/${location}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const reportes = await response.json();
          reportesPorUbicacion[location] = reportes;
        } else {
          reportesPorUbicacion[location] = [];
        }
      } catch (error) {
        console.log(`Error fetching reports for ${location}:`, error);
        reportesPorUbicacion[location] = [];
      }
    }

    setReportesData(reportesPorUbicacion);
  };

  // Generar las últimas 12 horas (para la vista normal) - CORREGIDO
  const generateLast12Hours = () => {
    const hours = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const hour = new Date(now);
      hour.setHours(now.getHours() - i, 0, 0, 0); // Asegurar minutos y segundos en 0
      const hourString = `${hour.getHours().toString().padStart(2, "0")}:00`;
      const dateString = hour.toLocaleDateString("es-ES");

      hours.unshift({
        hora: hourString,
        fecha: dateString,
        fechaCompleta: new Date(hour), // Crear nueva instancia
        timestamp: hour.getTime(),
        key: `${dateString}_${hourString}`,
      });
    }

    return hours;
  };

  // Determinar el estado del reporte - CORREGIDO
  const getReportStatus = (reporte, horaEsperada) => {
    if (!reporte) return "sin reporte";

    const horaReporte = new Date(reporte.createdAt);
    const horaEsperadaDate = new Date(horaEsperada.fechaCompleta);

    // Calcular diferencia en minutos
    const diferencia = horaReporte - horaEsperadaDate;
    const diferenciaMinutos = Math.abs(diferencia) / (1000 * 60);

    // Si el reporte se hizo después de la hora esperada + 15 minutos = Atrasado
    if (diferencia > 0 && diferenciaMinutos > 15) {
      return "Atrasado";
    }

    // Si el reporte se hizo antes de la hora esperada o dentro de los 15 minutos = A tiempo
    return "A tiempo";
  };

  // Obtener guardias activos en una hora específica - CORREGIDO
  const getActiveGuardsAtTime = (location, horaEsperada) => {
    if (!location) return [];

    const horaObjetivo = new Date(horaEsperada.fechaCompleta);
    const horaObjetivoFin = new Date(horaObjetivo);
    horaObjetivoFin.setHours(horaObjetivo.getHours() + 1, 0, 0, 0);

    return allEntradas.filter((entrada) => {
      // Verificar ubicación
      if (entrada.locacion !== location) return false;

      const entradaTime = new Date(entrada.entrada);
      const salidaTime = entrada.salida ? new Date(entrada.salida) : null;

      // El guardia está activo si:
      // 1. Entró antes del FIN de la hora objetivo Y
      // 2. (No tiene salida registrada O salió después del INICIO de la hora objetivo)
      const entroAntesDelFin = entradaTime < horaObjetivoFin;
      const salioDespuesDelInicio = !salidaTime || salidaTime > horaObjetivo;

      return entroAntesDelFin && salioDespuesDelInicio;
    });
  };

  // Función para determinar el estado del guardia en una hora específica
  const getGuardStatusAtTime = (guard, horaEsperada) => {
    if (!guard.entrada) return "inactivo";

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
  };

  // Verificar si hay guardia activo para una hora específica - CORREGIDO
  const hasActiveGuardAtTime = (location, horaEsperada) => {
    return getActiveGuardsAtTime(location, horaEsperada).length > 0;
  };

  // Encontrar reporte para una hora específica - CORREGIDO
  const findReportForHour = (reportes, horaEsperada) => {
    return reportes.find((reporte) => {
      const reportHour = new Date(reporte.createdAt);
      const expectedHour = new Date(horaEsperada.fechaCompleta);

      // Comparar año, mes, día y hora exactamente
      return (
        reportHour.getFullYear() === expectedHour.getFullYear() &&
        reportHour.getMonth() === expectedHour.getMonth() &&
        reportHour.getDate() === expectedHour.getDate() &&
        reportHour.getHours() === expectedHour.getHours()
      );
    });
  };

  // Toggle para expandir/contraer ubicación
  const toggleLocation = (location) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [location]: !prev[location],
    }));
  };

  // Abrir modal con detalles del reporte - ACTUALIZADO
  const openReportDetails = (reporte, horaData, location) => {
    const activeGuards = getActiveGuardsAtTime(location, horaData);
    setSelectedReport(reporte);
    setSelectedHourData({
      ...horaData,
      location,
      activeGuards,
    });
    setModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
    setSelectedHourData(null);
  };

  // Aplicar filtro de ubicación - MODIFICADO para incluir ubicaciones sin guardias
  const applyLocationFilter = (entradas, location) => {
    if (location === "Todos") {
      setFilteredActiveGuards(entradas);
    } else {
      const filtered = entradas.filter((entrada) => entrada.locacion === location);
      setFilteredActiveGuards(filtered);
    }
  };

  // Agrupar entradas por ubicación - MODIFICADO para incluir ubicaciones sin guardias
  const groupEntradasByLocation = (entradas) => {
    const grouped = {};

    // Primero agregamos todas las ubicaciones disponibles (incluso sin guardias)
    allLocations.forEach((locationObj) => {
      const locationName = locationObj.nombre;
      grouped[locationName] = entradas.filter((entrada) => entrada.locacion === locationName);
    });

    return grouped;
  };

  // Obtener todas las ubicaciones únicas (incluyendo las de entradas y todas las disponibles)
  const getAllUniqueLocations = () => {
    const locationsFromEntradas = [...new Set(allEntradas.map((entrada) => entrada.locacion))];
    const allLocationNames = allLocations.map((loc) => loc.nombre);
    const allAvailableLocations = [...new Set([...locationsFromEntradas, ...allLocationNames])];
    return allAvailableLocations;
  };

  // Helper functions para pasar al PDF Generator
  const pdfHelpers = {
    generateLast12Hours,
    findReportForHour,
    getReportStatus,
    getActiveGuardsAtTime,
    hasActiveGuardAtTime,
    getGuardStatusAtTime,
  };

  // Función para mostrar modal de selección de período
  const showPeriodoModal = (action, location = null) => {
    setDownloadAction({ type: action, location });
    setPeriodoModalVisible(true);
  };

  // Función para descargar PDF después de seleccionar período
  const handleDownloadWithPeriodo = async () => {
    setPeriodoModalVisible(false);

    if (!downloadAction) return;

    try {
      setDownloadingPdf(true);

      if (downloadAction.type === "location" && downloadAction.location) {
        // Descargar PDF de ubicación específica
        const entradasEnUbicacion = allEntradas.filter(
          (entrada) => entrada.locacion === downloadAction.location
        );
        const reportesUbicacion = reportesData[downloadAction.location] || [];

        // PERMITIR descargar incluso si no hay guardias, para mostrar ubicaciones vacías
        const htmlContent = PdfGenerator.generateLocationPdfContent(
          downloadAction.location,
          entradasEnUbicacion,
          reportesUbicacion,
          periodoPdf,
          pdfHelpers
        );

        const periodoTexto = periodoPdf === "24horas" ? "24_horas" : "semana";
        const fileName = `Historial_${downloadAction.location.replace(/\s+/g, "_")}_${periodoTexto}_${Date.now()}.pdf`;

        await PdfGenerator.generateAndSharePdf(
          htmlContent,
          fileName,
          `Descargar historial de ${downloadAction.location} - ${periodoTexto}`
        );
      } else if (downloadAction.type === "all") {
        // Descargar PDF de todas las ubicaciones
        const groupedEntradas = groupEntradasByLocation(allEntradas);

        const htmlContent = PdfGenerator.generateAllLocationsPdfContent(
          groupedEntradas,
          reportesData,
          periodoPdf,
          pdfHelpers
        );

        const periodoTexto = periodoPdf === "24horas" ? "24_horas" : "semana";
        const fileName = `Reporte_General_${periodoTexto}_${Date.now()}.pdf`;

        await PdfGenerator.generateAndSharePdf(
          htmlContent,
          fileName,
          `Descargar reporte general - ${periodoTexto}`
        );
      }
    } catch (error) {
      console.log("Error al generar PDF:", error);
      Alert.alert("Error", "No se pudo generar el PDF");
    } finally {
      setDownloadingPdf(false);
      setDownloadAction(null);
    }
  };

  // Componente para el modal de selección de período
  const PeriodoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={periodoModalVisible}
      onRequestClose={() => setPeriodoModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.periodoModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Período</Text>
            <TouchableOpacity
              onPress={() => setPeriodoModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.periodoModalBody}>
            <Text style={styles.periodoModalText}>Selecciona el período para el reporte:</Text>

            <TouchableOpacity
              style={[
                styles.periodoModalButton,
                periodoPdf === "24horas" && styles.periodoModalButtonActive,
              ]}
              onPress={() => setPeriodoPdf("24horas")}
            >
              <Ionicons
                name={periodoPdf === "24horas" ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={periodoPdf === "24horas" ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.periodoModalButtonText,
                  periodoPdf === "24horas" && styles.periodoModalButtonTextActive,
                ]}
              >
                Últimas 24 horas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodoModalButton,
                periodoPdf === "semana" && styles.periodoModalButtonActive,
              ]}
              onPress={() => setPeriodoPdf("semana")}
            >
              <Ionicons
                name={periodoPdf === "semana" ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={periodoPdf === "semana" ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.periodoModalButtonText,
                  periodoPdf === "semana" && styles.periodoModalButtonTextActive,
                ]}
              >
                Última semana (00:00 - actual)
              </Text>
            </TouchableOpacity>

            <View style={styles.periodoModalActions}>
              <TouchableOpacity
                style={styles.periodoModalCancel}
                onPress={() => setPeriodoModalVisible(false)}
              >
                <Text style={styles.periodoModalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.periodoModalConfirm}
                onPress={handleDownloadWithPeriodo}
              >
                <Text style={styles.periodoModalConfirmText}>
                  {downloadingPdf ? "Generando..." : "Descargar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Componente para el header de ubicación con botón de descarga - MEJORADO
  const LocationHeaderWithDownload = ({ location, entradas, isExpanded, onToggle }) => {
    // VERIFICAR SI HAY GUARDIAS ACTIVOS EN ESTE MOMENTO, no si alguna vez tuvo guardias
    const guardiasActivosAhora = getActiveGuardsAtTime(location, { fechaCompleta: new Date() });
    const tieneGuardiasActivos = guardiasActivosAhora.length > 0;

    // Encontrar la información completa de la ubicación
    const locationInfo = allLocations.find((loc) => loc.nombre === location);

    return (
      <TouchableOpacity style={styles.locationHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.locationHeaderLeft}>
          <Ionicons
            name="location-outline"
            size={20}
            color={tieneGuardiasActivos ? COLORS.primary : COLORS.textSecondary}
          />
          <View>
            <Text
              style={[styles.locationTitle, !tieneGuardiasActivos && styles.locationWithoutGuards]}
            >
              {location}
            </Text>
            {locationInfo && (
              <Text style={styles.locationSubtitle}>
                {locationInfo.numero_guardias} guardias asignados
              </Text>
            )}
          </View>
        </View>
        <View style={styles.locationHeaderRight}>
          <Text style={[styles.guardCount, !tieneGuardiasActivos && styles.guardCountZero]}>
            ({guardiasActivosAhora.length} activo{guardiasActivosAhora.length !== 1 ? "s" : ""})
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={tieneGuardiasActivos ? COLORS.primary : COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchAllEntradas();
  }, []);

  useEffect(() => {
    if (allEntradas.length > 0) {
      fetchAllLocations();
    }
  }, [allEntradas]);

  useEffect(() => {
    applyLocationFilter(allEntradas, selectedLocation);
  }, [selectedLocation, allEntradas]);

  useEffect(() => {
    if (allLocations.length > 0) {
      fetchReportesForLocations(allEntradas);
    }
  }, [allLocations, allEntradas]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllEntradas();
    setRefreshing(false);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation("Todos");
  };

  const formatTime = (date) => {
    if (!date) return "No registrada";
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "No registrada";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Componente para mostrar la lista de reportes por ubicación - COMPLETAMENTE CORREGIDO
  const ReportesList = () => {
    const allUniqueLocations = getAllUniqueLocations();

    // Si hay filtro de ubicación específica, mostramos solo esa ubicación
    const locationsToShow = selectedLocation !== "Todos" ? [selectedLocation] : allUniqueLocations;

    if (locationsToShow.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-outline" size={60} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No hay ubicaciones disponibles</Text>
          <Text style={styles.emptySubtext}>No se encontraron ubicaciones para mostrar</Text>
        </View>
      );
    }

    const groupedEntradas = groupEntradasByLocation(allEntradas);
    const last12Hours = generateLast12Hours();
    const last2Hours = last12Hours.slice(-2);

    return (
      <ScrollView style={styles.activeGuardsScroll} showsVerticalScrollIndicator={false}>
        {/* Botón para descargar reporte general */}
        {selectedLocation === "Todos" && (
          <DownloadPdfButton
            onPress={() => showPeriodoModal("all")}
            downloading={downloadingPdf}
            label={`Descargar Reporte General`}
            variant="primary"
          />
        )}

        {locationsToShow.map((location) => {
          const entradas = groupedEntradas[location] || [];
          const isExpanded = expandedLocations[location];
          const hoursToShow = isExpanded ? last12Hours : last2Hours;

          // VERIFICAR SI HAY GUARDIAS ACTIVOS EN ESTE MOMENTO, no si alguna vez tuvo guardias
          const guardiasActivosAhora = getActiveGuardsAtTime(location, {
            fechaCompleta: new Date(),
          });
          const tieneGuardiasActivos = guardiasActivosAhora.length > 0;

          return (
            <View
              key={location}
              style={[
                styles.locationGroup,
                !tieneGuardiasActivos && styles.locationGroupWithoutGuards,
              ]}
            >
              <LocationHeaderWithDownload
                location={location}
                entradas={entradas}
                isExpanded={isExpanded}
                onToggle={() => toggleLocation(location)}
              />

              {/* Tabla de reportes - Mostrar incluso si no hay guardias activos */}
              <View style={styles.reportesTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Hora de Reporte</Text>
                  <Text style={styles.tableHeaderText}>Hora</Text>
                  <Text style={styles.tableHeaderText}>Guardias Activos</Text>
                  <Text style={styles.tableHeaderText}>Estado</Text>
                </View>

                {hoursToShow.map((hora, index) => {
                  const reportesUbicacion = reportesData[location] || [];
                  const reporte = findReportForHour(reportesUbicacion, hora);
                  const tieneGuardiaActivo = hasActiveGuardAtTime(location, hora);
                  const estado = getReportStatus(reporte, hora);
                  const activeGuards = getActiveGuardsAtTime(location, hora);

                  return (
                    <TouchableOpacity
                      key={hora.key || hora.timestamp}
                      style={[
                        styles.tableRow,
                        index % 2 === 0 && styles.tableRowEven,
                        index === hoursToShow.length - 1 && styles.lastTableRow,
                        !tieneGuardiasActivos && styles.tableRowWithoutGuards,
                      ]}
                      onPress={() =>
                        tieneGuardiasActivos ? openReportDetails(reporte, hora, location) : null
                      }
                      activeOpacity={tieneGuardiasActivos ? 0.7 : 1}
                      disabled={!tieneGuardiasActivos}
                    >
                      <Text
                        style={[
                          styles.tableCell,
                          !tieneGuardiasActivos && styles.tableCellWithoutGuards,
                        ]}
                      >
                        {reporte
                          ? new Date(reporte.createdAt).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : tieneGuardiaActivo
                            ? "No reportado"
                            : "No activo"}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          !tieneGuardiasActivos && styles.tableCellWithoutGuards,
                        ]}
                      >
                        {hora.hora}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          !tieneGuardiasActivos && styles.tableCellWithoutGuards,
                        ]}
                      >
                        {activeGuards.length > 0
                          ? `${activeGuards.length} guardia${activeGuards.length !== 1 ? "s" : ""}`
                          : "Sin guardias"}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.statusCell,
                          estado === "A tiempo" && styles.statusOnTime,
                          estado === "Atrasado" && styles.statusLate,
                          estado === "sin reporte" && styles.statusNoReport,
                          !tieneGuardiasActivos && styles.statusNoGuards,
                        ]}
                      >
                        {tieneGuardiasActivos ? estado : "Sin guardias"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Botón de descarga - MOSTRAR SIEMPRE, incluso para ubicaciones sin guardias activos */}
              <DownloadPdfButton
                onPress={() => showPeriodoModal("location", location)}
                downloading={downloadingPdf}
                label={`Descargar ${location}`}
                // variant={tieneGuardiasActivos ? "primary" : "secondary"}
              />
            </View>
          );
        })}
      </ScrollView>
    );
  };

  // Modal de detalles del reporte
  const ReportDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Reporte</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedReport ? (
              <>
                {/* Información de la hora */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Información de la Hora</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hora esperada:</Text>
                    <Text style={styles.infoValue}>
                      {selectedHourData?.hora} - {selectedHourData?.fecha}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hora de reporte:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedReport.createdAt).toLocaleString("es-ES")}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estado:</Text>
                    <Text
                      style={[
                        styles.infoValue,
                        styles.statusValue,
                        getReportStatus(selectedReport, selectedHourData) === "A tiempo" &&
                          styles.statusOnTime,
                        getReportStatus(selectedReport, selectedHourData) === "Atrasado" &&
                          styles.statusLate,
                      ]}
                    >
                      {getReportStatus(selectedReport, selectedHourData)}
                    </Text>
                  </View>
                </View>

                {/* Guardia que hizo el reporte */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Guardia que Reportó</Text>
                  {selectedReport.guardias &&
                    selectedReport.guardias.map((guardia, index) => (
                      <View key={index} style={styles.guardiaReporte}>
                        <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                        <View style={styles.guardiaInfo}>
                          <Text style={styles.guardiaNombre}>{guardia}</Text>
                          <Text style={styles.guardiaRol}>Reportó esta hora</Text>
                        </View>
                      </View>
                    ))}
                </View>

                {/* Descripción */}
                {selectedReport.descripcion && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Descripción del Reporte</Text>
                    <Text style={styles.descriptionText}>{selectedReport.descripcion}</Text>
                  </View>
                )}

                {/* Guardias activos en esa hora */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    Guardias Activos en ese Momento ({selectedHourData?.activeGuards?.length || 0})
                  </Text>
                  {selectedHourData?.activeGuards?.length > 0 ? (
                    selectedHourData.activeGuards.map((guard, index) => {
                      const estadoGuardia = getGuardStatusAtTime(guard, selectedHourData);
                      let icono = "●";
                      let color = COLORS.success;

                      if (estadoGuardia === "entrada") {
                        icono = "→";
                        color = COLORS.success;
                      } else if (estadoGuardia === "salida") {
                        icono = "←";
                        color = COLORS.error;
                      } else if (estadoGuardia === "entrada-salida") {
                        icono = "↔";
                        color = COLORS.warning;
                      } else if (estadoGuardia === "activo") {
                        icono = "●";
                        color = COLORS.info;
                      }

                      return (
                        <View key={guard._id} style={styles.guardiaActiva}>
                          <Text style={[styles.guardiaIcono, { color }]}>{icono}</Text>
                          <View style={styles.guardiaInfo}>
                            <Text style={styles.guardiaNombre}>{guard.nombre}</Text>
                            <Text style={styles.guardiaDetalles}>
                              Entrada: {formatDate(guard.entrada)} {formatTime(guard.entrada)}
                              {guard.salida &&
                                ` • Salida: ${formatDate(guard.salida)} ${formatTime(guard.salida)}`}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noGuardiasText}>
                      No había guardias activos en ese momento
                    </Text>
                  )}
                </View>
              </>
            ) : (
              // Cuando no hay reporte
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Sin Reporte</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Hora:</Text>
                  <Text style={styles.infoValue}>
                    {selectedHourData?.hora} - {selectedHourData?.fecha}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estado:</Text>
                  <Text style={[styles.infoValue, styles.statusValue, styles.statusNoReport]}>
                    {hasActiveGuardAtTime(selectedHourData?.location, selectedHourData)
                      ? "No reportado"
                      : "No activo"}
                  </Text>
                </View>

                {/* Guardias activos en esa hora */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    Guardias Activos en ese Momento ({selectedHourData?.activeGuards?.length || 0})
                  </Text>
                  {selectedHourData?.activeGuards?.length > 0 ? (
                    selectedHourData.activeGuards.map((guard, index) => {
                      const estadoGuardia = getGuardStatusAtTime(guard, selectedHourData);
                      let icono = "●";
                      let color = COLORS.success;

                      if (estadoGuardia === "entrada") {
                        icono = "→";
                        color = COLORS.success;
                      } else if (estadoGuardia === "salida") {
                        icono = "←";
                        color = COLORS.error;
                      } else if (estadoGuardia === "entrada-salida") {
                        icono = "↔";
                        color = COLORS.warning;
                      } else if (estadoGuardia === "activo") {
                        icono = "●";
                        color = COLORS.info;
                      }

                      return (
                        <View key={guard._id} style={styles.guardiaActiva}>
                          <Text style={[styles.guardiaIcono, { color }]}>{icono}</Text>
                          <View style={styles.guardiaInfo}>
                            <Text style={styles.guardiaNombre}>{guard.nombre}</Text>
                            <Text style={styles.guardiaDetalles}>
                              Entrada: {formatDate(guard.entrada)} {formatTime(guard.entrada)}
                              {guard.salida &&
                                ` • Salida: ${formatDate(guard.salida)} ${formatTime(guard.salida)}`}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noGuardiasText}>
                      No había guardias activos en ese momento
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={() => "dummy"}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
              onClearLocation={handleClearLocation}
              placeholder="Seleccionar ubicación"
              label="Filtrar por ubicación:"
            />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={<ReportesList />}
      />

      <ReportDetailsModal />
      <PeriodoModal />
    </View>
  );
}
