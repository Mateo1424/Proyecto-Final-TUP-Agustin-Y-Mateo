export default function LoadingScreen({ fullScreen = true, text = 'Cargando' }) {
  return <div role="status" className={`flex items-center justify-center p-8 ${fullScreen ? 'min-h-screen' : 'min-h-[40vh]'}`} style={{ background: '#0b0e0d', color: '#c7f36b' }}><p>{text}…</p></div>;
}
