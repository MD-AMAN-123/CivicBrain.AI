const apiKey = "AIzaSyB1_BfLS03OKjN2k65dLbYTMoTZ9ZdKunU";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function test() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    // Only print names to save space
    console.log(data.models.map(m => m.name));
  } catch (e) {
    console.error(e);
  }
}

test();
