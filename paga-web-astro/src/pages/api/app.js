// API endpoint: combinamos calidad del aire y clima (temperatura) desde Open-Meteo
const AIR_API =
  "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=19.43&longitude=-99.13&current=us_aqi,carbon_monoxide";
const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast?latitude=19.43&longitude=-99.13&current_weather=true";

export async function GET() {
  try {
    // Ejecutamos ambas llamadas en paralelo
    const [airRes, weatherRes] = await Promise.all([
      fetch(AIR_API),
      fetch(WEATHER_API),
    ]);

    if (!airRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Open-Meteo air-quality error",
          status: airRes.status,
        }),
        { status: 502 }
      );
    }
    if (!weatherRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Open-Meteo weather error",
          status: weatherRes.status,
        }),
        { status: 502 }
      );
    }

    const airData = await airRes.json();
    const weatherData = await weatherRes.json();

    // Construimos un objeto combinado para el frontend
    const combined = {
      air: airData,
      weather: weatherData,
    };

    // // Log para debugging en servidor
    // console.log("Open-Meteo combined:", {
    //   air: airData?.current ?? null,
    //   temp: weatherData?.current_weather ?? null,
    // });

    return new Response(JSON.stringify(combined), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Esto iría en un archivo .astro, .jsx, o .svelte
// (O en un <script> dentro de un .html o .astro)

async function obtenerDatosDeMiApi() {
  try {
    // 1. Llama a TU PROPIO endpoint (no a Open-Meteo directamente)
    const response = await fetch("/api/calidad-aire"); // Asegúrate que esta URL sea correcta

    if (!response.ok) {
      throw new Error(`Error de mi API: ${response.status}`);
    }

    // 2. Convierte la respuesta a JSON
    const data = await response.json();

    // 3. ¡AQUÍ IMPRIMES EN EL NAVEGADOR!
    console.log("Datos recibidos desde mi API:");
    console.log(data);

    // 4. Ahora puedes usar 'data' para mostrarlo en tu página
    // document.getElementById('aqi').innerText = data.current.us_aqi;
  } catch (error) {
    console.error("No se pudieron obtener los datos:", error);
  }
}

// Llama a la función para que se ejecute
// obtenerDatosDeMiApi();
// obtenerDatos();
