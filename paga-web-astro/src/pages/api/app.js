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

    // Normalizar/extraer un objeto 'current' para la calidad del aire cuando
    // el API devuelve sólo series horarias (hourly). Esto evita que el
    // frontend reciba `undefined` y muestre "N/D".
    let airCurrent = airData?.current ?? null;
    let airUnits = airData?.current_units ?? airData?.hourly_units ?? null;

    if (!airCurrent && airData?.hourly) {
      // Si sólo hay datos por hora, tomamos el último valor disponible.
      const times = airData.hourly.time || [];
      const lastIdx = Math.max(0, times.length - 1);

      airCurrent = {};
      // Campos comunes que interesan al frontend
      if (airData.hourly.us_aqi)
        airCurrent.us_aqi = airData.hourly.us_aqi[lastIdx];
      if (airData.hourly.aqi) airCurrent.aqi = airData.hourly.aqi[lastIdx];
      if (airData.hourly.carbon_monoxide)
        airCurrent.carbon_monoxide = airData.hourly.carbon_monoxide[lastIdx];
      // Añadir una marca temporal si existe
      if (airData.hourly.time) airCurrent.time = airData.hourly.time[lastIdx];
    }

    // Normalizar current_weather (suele existir) — si no, intentar inferir
    let weatherCurrent = weatherData?.current_weather ?? null;
    if (!weatherCurrent && weatherData?.hourly) {
      const times = weatherData.hourly.time || [];
      const lastIdx = Math.max(0, times.length - 1);
      weatherCurrent = {};
      if (weatherData.hourly.temperature_2m)
        weatherCurrent.temperature = weatherData.hourly.temperature_2m[lastIdx];
      if (weatherData.hourly.time)
        weatherCurrent.time = weatherData.hourly.time[lastIdx];
    }

    // Construimos un objeto combinado para el frontend con campos normalizados
    const combined = {
      air: {
        ...airData,
        current: airCurrent,
        current_units: airUnits,
      },
      weather: {
        ...weatherData,
        current_weather: weatherCurrent,
      },
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
