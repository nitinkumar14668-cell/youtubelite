const keys = [
  "AIzaSyA9H9zDYNTL20NIJvPVUg9hruW0NGzg1bY",
  "AIzaSyAmTB47cBxEZEzafeKEc_VdrrqG-VZhXzw",
  "AIzaSyCJDcC4N0tV0HqXqNxpxhvnTnxS7YhYiZM",
  "AIzaSyBYtwPaBqGCzj0UzcIDQFw4VaMI0yGp8UM",
  "AIzaSyDoFs9NDnG7u7wQ8TdqXoCsKRtu3g54Yi0",
  "AIzaSyA1XkVG8NNqbQk_ZL9JlMjUGs9L9IEZ3OA",
  "AIzaSyCiuJUBPNZ0Av0OxnuV6sLK5W37F5iU0wg",
  "AIzaSyBzH43Dz316tHtBoMDDpGRsEyUBGBkR63A",
  "AIzaSyB1J1cmLSJKQOGpuVZWZW0nIiYXjudYoTA",
  "AIzaSyBEgMeYBl2hVBM_PgnFM2WGFw7daOT98MI",
  "AIzaSyBUXU97K1SytnMHcxJM76EcGxfgb155u1U",
  "AIzaSyB-7IP69Ih_6aNI4OsBDj6q-Nr0iTSxdwM",
  "AIzaSyCdMudMybB1_GmuBOlRGhsUttJQibdu_vU",
  "AIzaSyDpRI4V9cjSNN1G1psAx4Ep4jSjRM1-kAs",
  "AIzaSyDxTmLZrOmVW8zyTxN-3ENZsmzcV72VVXw",
  "AIzaSyD-yWjiGsqN6_DtSZzseHhZRQ5vJMTE70A",
  "AIzaSyBYmdyhqLyD14v4EY3rhitCMe8K8eS3SpU",
  "AIzaSyCoUjp8bKEgUJq-UfK-A3colFPQz7S9eSs",
  "AIzaSyDUwuBgT-OFnOkoCQY494ahaosqbsHLTUA",
  "AIzaSyBEP8wq45Mu2VaU9cJJC1a-E2ylDD4Z7VE",
  "AIzaSyB2qeWf378Drb_9zyu6d0X6-_wXJOFUzWs",
  "AIzaSyACwN6AghdaJW97eAFaQAWB_Pe6pC_n_K0",
  "AIzaSyAb8JvgBt32VjkmRkMEDcGYdmvpztaMt7E",
  "AIzaSyAn_9ejLAl6FXcUu5dgqwCDORtFiU6y8Js",
  "AIzaSyA3xutskL41RPa5zEfUrd5bIXzTavY3btc",
  "AIzaSyCoTsgimZ9L1yRzsQC-RINxFP6qSJBU4zU",
  "AIzaSyBc15dIslUr3pSQg-_N5K9X-uSFDVqzjaA",
  "AIzaSyBTfUQu8-O-hhZueWM3VLhRV5miVYjFlcU",
  "AIzaSyDMjOQujD7MUud83-LYD-kj2IiVsERI-L0",
  "AIzaSyCQkQ1qu6qX9YuvTHHr0I4BbFuP4yNToko",
  "AIzaSyA-PUmjrPaIWsdrrBXckkfyRZaAr43fOc8",
  "AIzaSyApiGTDZdKWkUJBlU5MSXRyEORpacfGadc",
  "AIzaSyD6pYoZT_bULkX_xIfjtWd6aV17rDS6f_I",
  "AIzaSyC32fhwHLron2Pzzxgp7rLAyERfA29MVHw",
  "AIzaSyC5IZi89mLZ7FLr0uS_ge4ZcLCUgITJz2Q",
  "AIzaSyCXmO3BJG4P7AauAEVt3jyTcrbBRyIEUFU",
  "AIzaSyDqvwpN_MzLM-eRrs_idZmpOWWAgEA-TaQ",
  "AIzaSyCd7I5PH1_6tyu4bGGMXgCZM-pRJMYUQx4",
  "AIzaSyACRfUg4Azm82iAqszsLrcLU6EX0cZGyCc",
  "AIzaSyA2U7gjXpMylxvmZiAMwsaPj1Uu5Wut8EI"
];

async function run() {
  for (const key of keys) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&type=video&key=${key}`);
    const data = await res.json();
    if (!data.error) {
      console.log('WORKING KEY:', key);
      return;
    }
  }
  console.log('ALL KEYS FAILED');
}
run();
