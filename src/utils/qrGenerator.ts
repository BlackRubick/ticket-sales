export const generateQRCodeSVG = (data: string): string => {
  // Simple mock QR code generator
  const size = 200;
  const modules = 25; // 25x25 grid for QR code
  const moduleSize = size / modules;
  
  // Create a simple pattern based on the data
  const pattern = [];
  const hash = data.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  for (let i = 0; i < modules * modules; i++) {
    pattern.push((hash + i) % 3 === 0);
  }
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (pattern[y * modules + x]) {
        svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
      }
    }
  }
  
  // Add corner markers
  const cornerSize = moduleSize * 7;
  const corners = [
    { x: 0, y: 0 },
    { x: size - cornerSize, y: 0 },
    { x: 0, y: size - cornerSize }
  ];
  
  corners.forEach(corner => {
    svg += `<rect x="${corner.x}" y="${corner.y}" width="${cornerSize}" height="${cornerSize}" fill="white" stroke="black" stroke-width="2"/>`;
    svg += `<rect x="${corner.x + moduleSize * 2}" y="${corner.y + moduleSize * 2}" width="${moduleSize * 3}" height="${moduleSize * 3}" fill="black"/>`;
  });
  
  svg += '</svg>';
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};