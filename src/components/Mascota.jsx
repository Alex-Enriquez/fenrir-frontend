import loboImg from '../assets/lobo.png'

function Mascota() {
  return (
    <div className="mascota-wrapper">
      <img
        className="mascota-img"
        src={loboImg}
        alt="Mascota"
        style={{ width: '200px', height: '200px', objectFit: 'contain', display: 'block' }}
      />
      <div className="mascota-shadow" />
    </div>
  )
}

export default Mascota
