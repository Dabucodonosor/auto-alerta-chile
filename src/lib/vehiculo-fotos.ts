/**
 * Utilidades y catálogo de imágenes para vehículos en AutoAlerta.
 * Permite identificar modelos verificados o recurrir a una ilustración profesional genérica,
 * así como comprimir fotografías subidas desde teléfonos para asegurar persistencia en LocalStorage.
 */

export interface InfoImagenVehiculo {
  url: string;
  tipo: "propia" | "modelo" | "generica";
  descripcion: string;
}

interface ModeloVerificado {
  marcas: string[];
  modelos: string[];
  anioMin?: number;
  anioMax?: number;
  url: string;
  nombreOficial: string;
}

const CATALOGO_MODELOS: ModeloVerificado[] = [
  {
    marcas: ["changan"],
    modelos: ["cs15", "cs 15"],
    url: "/cars/changan-cs15.jpg",
    nombreOficial: "Changan CS15",
  },
  {
    marcas: ["toyota"],
    modelos: ["yaris", "yaris sport", "yaris sedan"],
    url: "/cars/toyota-yaris.jpg",
    nombreOficial: "Toyota Yaris",
  },
  {
    marcas: ["suzuki"],
    modelos: ["swift", "swift sport", "swift dzire", "dzire"],
    url: "/cars/suzuki-swift.jpg",
    nombreOficial: "Suzuki Swift",
  },
  {
    marcas: ["chevrolet"],
    modelos: ["sail", "sail sedan"],
    url: "/cars/chevrolet-sail.jpg",
    nombreOficial: "Chevrolet Sail",
  },
];

const ILUSTRACION_GENERICA: InfoImagenVehiculo = {
  url: "/cars/vehiculo-generico.svg",
  tipo: "generica",
  descripcion: "Ilustración automotriz profesional",
};

/**
 * Retorna la imagen adecuada para el vehículo:
 * 1. Foto propia subida por el usuario (si existe).
 * 2. Foto oficial del modelo exacto si está en el catálogo verificado.
 * 3. Ilustración genérica profesional si el modelo no está en el catálogo verificado
 *    (garantizando nunca mostrar un modelo equivocado).
 */
export function obtenerImagenVehiculo(vehiculo?: {
  marca?: string;
  modelo?: string;
  anio?: number;
  foto?: string;
}): InfoImagenVehiculo {
  if (!vehiculo) return ILUSTRACION_GENERICA;

  // 1. Fotografía propia subida por el usuario
  if (vehiculo.foto && vehiculo.foto.trim() !== "") {
    return {
      url: vehiculo.foto,
      tipo: "propia",
      descripcion: "Fotografía personalizada del vehículo",
    };
  }

  const marcaNorm = (vehiculo.marca || "").trim().toLowerCase();
  const modeloNorm = (vehiculo.modelo || "").trim().toLowerCase();

  if (!marcaNorm || !modeloNorm) {
    return ILUSTRACION_GENERICA;
  }

  // 2. Coincidencia verificada en catálogo
  const match = CATALOGO_MODELOS.find((item) => {
    const coincideMarca = item.marcas.some((m) => marcaNorm.includes(m) || m.includes(marcaNorm));
    const coincideModelo = item.modelos.some((mod) => modeloNorm.includes(mod) || mod.includes(modeloNorm));
    return coincideMarca && coincideModelo;
  });

  if (match) {
    return {
      url: match.url,
      tipo: "modelo",
      descripcion: `Fotografía representativa ${match.nombreOficial}`,
    };
  }

  // 3. Fallback a ilustración genérica (cumple con la regla de no mostrar modelos incorrectos)
  return ILUSTRACION_GENERICA;
}

/**
 * Comprime una imagen seleccionada desde la galería o cámara para
 * garantizar que quepa sin problemas en LocalStorage (reduce a ~40-80 KB).
 */
export function comprimirImagen(file: File, maxDim = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si no es imagen, rechazar amigablemente
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo seleccionado no es una imagen válida."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo cargar la imagen para procesarla."));
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(src);
            return;
          }

          // Dibujar con suavizado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Obtener base64 comprimido en JPEG
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
