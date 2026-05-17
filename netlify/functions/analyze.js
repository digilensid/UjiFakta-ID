exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const text = body.text;

    const prompt = `
Kamu adalah AI fact checker Indonesia.
Analisis informasi berikut:
"${text}"

Balas hanya JSON valid:
{
"judul":"",
"status":"valid|hoaks|miring|netral",
"tentang":"",
"cek_fakta":"",
"data":"",
"arahan":""
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const result = await response.json();
    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid AI response" })
      };
    }

    const parsed = JSON.parse(match[0]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) })
    };
  }
};
