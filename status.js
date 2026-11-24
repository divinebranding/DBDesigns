export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;
  const url = req.query.url;
  if (!token || !url || !url.startsWith("https://api.replicate.com/")) {
    return res.status(400).json({ error: "Invalid processing request." });
  }
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: "Could not check processing status." });
  const output = Array.isArray(data.output) ? data.output[0] : data.output;
  return res.status(200).json({ status: data.status, output, error: data.error });
}