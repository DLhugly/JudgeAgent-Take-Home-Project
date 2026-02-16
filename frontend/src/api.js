export async function judgeVideo(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/judge/video", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || res.statusText);
  return data;
}
