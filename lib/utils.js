// this function will convert the createdAt to this format: "May 2023"
export function formatMemberSince(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

// this function will convert the createdAt to this format: "May 15, 2023"
// export function formatPublishDate(dateString) {
//   const date = new Date(dateString);
//   const month = date.toLocaleString("default", { month: "long" });
//   const day = date.getDate();
//   const year = date.getFullYear();
//   return `${month} ${day}, ${year}`;
// }
export function formatPublishDate(dateString) {
  const date = new Date(dateString);

  // Obtener día, mes y año (2 dígitos cada uno)
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 porque los meses van de 0 a 11
  const year = date.getFullYear();

  // Obtener horas y minutos (2 dígitos cada uno)
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}
