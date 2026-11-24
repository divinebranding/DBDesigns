export const config = { api: { bodyParser: false } };

async function readMultipart(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const type = req.headers["content-type"] || "";
  const boundary = type.split("boundary=")[1];
  if (!boundary) throw new Error("Upload was not received correctly.");
  const raw = body.toString("latin1");
  const parts = raw.split("--" + boundary);
  let file = null;
  let action = "background";
  for (const part of parts) {
    const split = part.indexOf("\r\n\r\n");
    if (split < 0) continue;
    const headers = part.slice(0, split);
    const content = part.slice(split + 4).replace(/\r\n$/, "");
    if (headers.includes('name="action"')) action = content.trim();
    if (headers.includes('name="image"')) {
      const filename = (headers.match(/filename="([^"]+)"/) || [])[1] || "artwork.png";
      const mime = (headers.match(/Content-Type:\s*([^\r\n]+)/i) || [])[1]?.trim() || "image/png";
      file = { buffer: Buffer.from(content, "latin1"), filename, mime };
    }
  }
  if (!file) throw new Error("Please choose an image first.");
  return { file, action };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return res.status(503).json({ error: "The AI service is not connected yet. Add your Replicate API token in the Vercel project settings." });

  try {
    const { file, action } = await readMultipart(req);
    const form = new FormData();
    form.append("content", new Blob([file.buffer], { type: file.mime }), file.filename);
    const uploaded = await fetch("https://api.replicate.com/v1/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    if (!uploaded.ok) throw new Error("Could not upload the image to the AI service.");
    const fileData = await uploaded.json();

    const model = action === "upscale"
      ? "nightmareai/real-esrgan"
      : "bria/remove-background";

    const predictionResponse = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait"
      },
      body: JSON.stringify({
        input: action === "upscale"
          ? { image: fileData.urls.get, scale: 4, face_enhance: false }
          : { image: fileData.urls.get }
      })
    });
    const prediction = await predictionResponse.json();
    if (!predictionResponse.ok) throw new Error(prediction.detail || prediction.error || "The AI could not process this image.");
    if (prediction.status === "failed" || prediction.status === "canceled") throw new Error(prediction.error || "Image processing failed.");
    if (prediction.output) {
      const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      return res.status(200).json({ output, status: "succeeded" });
    }
    return res.status(202).json({ prediction: prediction.urls?.get, status: prediction.status || "processing" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Something went wrong." });
  }
}