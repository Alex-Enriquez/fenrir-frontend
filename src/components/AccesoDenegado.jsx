function AccesoDenegado({ mensaje }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '4rem 1rem', textAlign: 'center',
    }}>
      <div className="acceso-denegado-cara">🙁</div>
      <h2 style={{ color: '#F87171', fontSize: '1.5rem', margin: '1.25rem 0 0.5rem' }}>
        ¡Ups! No tienes acceso a esta sección
      </h2>
      <p style={{ color: 'var(--texto-tenue)', fontSize: '0.9rem', maxWidth: '380px' }}>
        {mensaje || 'Esta parte del sistema es solo para administradores.'}
      </p>
    </div>
  )
}

export default AccesoDenegado
