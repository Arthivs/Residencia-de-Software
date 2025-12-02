export const TODOS_BAIRROS = [
  'Jardins','São Conrado','Centro','Atalaia','Coroa do Meio','Salgado Filho','Grageru','Jardim Centenário',
  'Santa Maria','Siqueira Campos','Treze de Julho','São José','Ponto Novo','Luzia','Getúlio Vargas','América',
  'Cirurgia','Mosqueiro','Porto Dantas','Industrial','Japãozinho','Olaria','Santos Dumont','Soledade','Suíssa',
  'Palestina','Novo Paraíso','Dezoito do Forte','Inácio Barbosa','José Conrado de Araújo','Lamarão','Santa Tereza','Santo Antônio','Zona de Expansão'
];

export const bairrosCoordinates = {
  'Jardins': { lat: -10.9452, lng: -37.0728 },
  'São Conrado': { lat: -10.9385, lng: -37.0512 },
  'Centro': { lat: -10.9117, lng: -37.0678 },
  'Atalaia': { lat: -10.9589, lng: -37.0447 },
  'Coroa do Meio': { lat: -10.9234, lng: -37.0615 },
  'Salgado Filho': { lat: -10.9301, lng: -37.0803 },
  'Grageru': { lat: -10.9156, lng: -37.0549 },  
};

export const getBairroCoordinatesSync = (bairroName) => {
  const c = bairrosCoordinates[bairroName];
  if (!c) return { lat: -10.9117 + (Math.random() - 0.5) * 0.02, lng: -37.0678 + (Math.random() - 0.5) * 0.02 };
  return c;
};
