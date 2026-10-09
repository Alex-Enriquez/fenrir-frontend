import { useId } from "react";
import "./LoboLogin.css";

/*
  Lobo de Fenrir para el Login.
  estado: "reposo" | "correo" | "contrasena" | "error" | "exito"
  mostrando: true cuando la contraseña está visible
  largoCorreo: longitud del texto del correo (para que lo siga con la mirada)
*/
export default function LoboLogin({ estado = "reposo", mostrando = false, largoCorreo = 0, children }) {
  const uid = useId().replace(/:/g, "");
  const g = (n) => `${n}-${uid}`;

  let px = 0, py = 0;
  if (estado === "correo") { const n = Math.min(largoCorreo, 28); px = -3 + (n / 28) * 6; py = 3; }
  else if (estado === "contrasena" && mostrando) { px = 3; py = 1; }
  else if (estado === "error") { py = -2; }
  else if (estado === "exito") { px = 1; }
  else if (estado === "espiando") { px = 3; py = 2; }

  const clases = ["lobo-escenario", `lobo-${estado}`, mostrando ? "lobo-mostrando" : ""].join(" ");

  return (
    <div className={clases} style={{ "--px": `${px.toFixed(1)}px`, "--py": `${py}px` }}>
      <div className="lobo-pos" aria-hidden="true">
        <div className="lobo">
          <svg viewBox="0 0 200 220">
            <defs>
              <radialGradient id={g("fur")} cx=".5" cy=".28" r=".75">
                <stop offset="0" stopColor="#7389BB" /><stop offset=".6" stopColor="#4E6597" /><stop offset="1" stopColor="#3A5082" />
              </radialGradient>
              <linearGradient id={g("earOut")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#26396A" /><stop offset="1" stopColor="#3F5689" />
              </linearGradient>
              <linearGradient id={g("earIn")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F6DCCF" /><stop offset="1" stopColor="#D9A597" />
              </linearGradient>
              <linearGradient id={g("muzzle")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D7E0F0" />
              </linearGradient>
              <linearGradient id={g("paw")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5A71A4" /><stop offset="1" stopColor="#3A5082" />
              </linearGradient>
            </defs>

            {/* orejas */}
            <g className="lobo-oreja lobo-oreja-izq">
              <path d="M38 92 C30 60 34 30 46 12 C60 26 74 46 82 62 Z" fill={`url(#${g("earOut")})`} />
              <path d="M48 80 C44 60 47 40 52 28 C61 40 68 52 72 62 Z" fill={`url(#${g("earIn")})`} />
              <path d="M50 70 L56 58 M54 78 L62 66" stroke="#EFF3FA" strokeWidth="2" strokeLinecap="round" opacity=".7" />
            </g>
            <g className="lobo-oreja lobo-oreja-der">
              <path d="M162 92 C170 60 166 30 154 12 C140 26 126 46 118 62 Z" fill={`url(#${g("earOut")})`} />
              <path d="M152 80 C156 60 153 40 148 28 C139 40 132 52 128 62 Z" fill={`url(#${g("earIn")})`} />
              <path d="M150 70 L144 58 M146 78 L138 66" stroke="#EFF3FA" strokeWidth="2" strokeLinecap="round" opacity=".7" />
            </g>

            {/* cabeza, coronilla, máscara, mejillas y hocico */}
            <path d="M100 50 C130 50 156 64 164 92 L178 102 L166 110 L182 122 L163 127 L172 142 C152 152 130 164 100 166 C70 164 48 152 28 142 L37 127 L18 122 L34 110 L22 102 L36 92 C44 64 70 50 100 50 Z" fill={`url(#${g("fur")})`} />
            <path d="M90 54 L96 42 L100 52 L106 40 L110 54 Z" fill="#4E6597" />
            <path d="M100 52 C86 52 74 58 70 72 C82 80 93 88 100 104 C107 88 118 80 130 72 C126 58 114 52 100 52 Z" fill="#2A3D6E" />
            <path d="M46 124 L36 140 C58 155 80 164 100 166 C120 164 142 155 164 140 L154 124 C142 138 122 147 100 147 C78 147 58 138 46 124 Z" fill={`url(#${g("muzzle")})`} />
            <path d="M100 94 C84 94 70 106 63 121 C59 134 68 151 100 156 C132 151 141 134 137 121 C130 106 116 94 100 94 Z" fill={`url(#${g("muzzle")})`} />
            <ellipse cx="60" cy="130" rx="8" ry="4.5" fill="#F2A3A0" opacity=".45" />
            <ellipse cx="140" cy="130" rx="8" ry="4.5" fill="#F2A3A0" opacity=".45" />

            {/* cejas */}
            <path className="lobo-ceja lobo-ceja-izq" d="M62 86 Q74 79 87 85" stroke="#1B2A52" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path className="lobo-ceja lobo-ceja-der" d="M113 85 Q126 79 138 86" stroke="#1B2A52" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* ojos */}
            <g className="lobo-ojo lobo-ojo-izq"><g className="lobo-parpadeo"><g className="lobo-mirada">
              <ellipse cx="76" cy="106" rx="12.5" ry="14.5" fill="#160D22" />
              <ellipse cx="76" cy="108" rx="9" ry="10.5" fill="none" stroke="#3B2850" strokeWidth="1.6" />
              <circle cx="71" cy="100" r="5" fill="#fff" />
              <circle cx="80.5" cy="113" r="2" fill="#fff" opacity=".85" />
            </g></g></g>
            <g className="lobo-ojo lobo-ojo-der"><g className="lobo-parpadeo"><g className="lobo-mirada">
              <ellipse cx="124" cy="106" rx="12.5" ry="14.5" fill="#160D22" />
              <ellipse cx="124" cy="108" rx="9" ry="10.5" fill="none" stroke="#3B2850" strokeWidth="1.6" />
              <circle cx="119" cy="100" r="5" fill="#fff" />
              <circle cx="128.5" cy="113" r="2" fill="#fff" opacity=".85" />
            </g></g></g>
            <path className="lobo-ojo-feliz" d="M112 109 Q124 95 136 109" stroke="#160D22" strokeWidth="5" strokeLinecap="round" fill="none" />

            {/* nariz y boca */}
            <path d="M89 124 C89 118 111 118 111 124 C111 131 105 135 100 135 C95 135 89 131 89 124 Z" fill="#141A2E" />
            <ellipse cx="95.5" cy="122.5" rx="3.6" ry="1.8" fill="#fff" opacity=".55" />
            <path d="M100 135 L100 140 M100 140 Q92 148 84 142 M100 140 Q108 148 116 142" stroke="#141A2E" strokeWidth="2.6" strokeLinecap="round" fill="none" />

            {/* patas */}
            <g className="lobo-pata lobo-pata-izq">
              <path d="M50 186 C50 174 60 166 72 166 C84 166 94 174 94 186 C94 200 85 208 72 208 C59 208 50 200 50 186 Z" fill={`url(#${g("paw")})`} />
              <path d="M53 181 C54 172 62 168 72 168 C82 168 90 172 91 181 C85 177 79 176 72 176 C65 176 59 177 53 181 Z" fill="#DCE4F2" />
              <path d="M65 169 L65 179 M79 169 L79 179" stroke="#2A3D6E" strokeWidth="2" strokeLinecap="round" opacity=".6" />
            </g>
            <g className="lobo-pata lobo-pata-der">
              <path d="M106 186 C106 174 116 166 128 166 C140 166 150 174 150 186 C150 200 141 208 128 208 C115 208 106 200 106 186 Z" fill={`url(#${g("paw")})`} />
              <path d="M109 181 C110 172 118 168 128 168 C138 168 146 172 147 181 C141 177 135 176 128 176 C121 176 115 177 109 181 Z" fill="#DCE4F2" />
              <path d="M121 169 L121 179 M135 169 L135 179" stroke="#2A3D6E" strokeWidth="2" strokeLinecap="round" opacity=".6" />
            </g>
          </svg>
        </div>
      </div>
      <div className="lobo-tarjeta">{children}</div>
    </div>
  );
}
