// Dirección del backend.
// Por defecto es la de desarrollo en esta misma máquina. Para usar otra (por ejemplo, el servidor
// de la empresa), crea un archivo .env.local en la raíz del frontend con una línea así:
//     VITE_API_URL=http://IP-DEL-SERVIDOR:8000/api
// y reinicia `npm run dev` (o vuelve a correr `npm run build`).
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
