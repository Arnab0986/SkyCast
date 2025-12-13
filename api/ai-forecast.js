export default async function handler(req, res) {
  const { city, temp, code } = req.body;

  const prompt = `
You are a professional meteorologist.
City: ${city}
Temperature: ${temp}°C
Condition: ${code}

Give a short, helpful human forecast with advice.
`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const d = await r.json();
  res.status(200).json({ text: d.choices[0].message.content });
}
