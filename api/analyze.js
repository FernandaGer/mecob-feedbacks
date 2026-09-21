module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, fileData, mimeType } = req.body
    const apiKey = process.env.GEMINI_API_KEY

    const parts = []

    // Adiciona o arquivo se enviado
    if (fileData && mimeType) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: fileData
        }
      })
    }

    parts.push({ text: prompt })

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API Gemini')
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return res.status(200).json({ text })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
