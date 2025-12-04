import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import * as FaIcons from 'react-icons/fa';

interface HeaderPadraoProps {
  titulo: string;
  subtitulo?: string;
  icone?: keyof typeof FaIcons | LucideIcon | ReactNode;
}

export default function HeaderPadrao({ titulo, subtitulo, icone }: HeaderPadraoProps) {
  const isFaIcons = typeof icone === 'string' && icone in FaIcons;
  const FaIconComponent = isFaIcons ? FaIcons[icone as keyof typeof FaIcons] : null;
  const LucideIconComponent = icone as React.ElementType;

  return (
    <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          {icone && (
            <div className="w-8 h-8">
              {isFaIcons && FaIconComponent ? (
                <FaIconComponent className="w-full h-full text-white" />
              ) : typeof icone === 'function' ? (
                <LucideIconComponent className="w-full h-full text-white" />
              ) : (
                <div className="w-full h-full">{icone}</div>
              )}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {titulo}
          </h1>
        </div>

        {subtitulo && (
          <p className="text-blue-100 text-lg">
            {subtitulo}
          </p>
        )}
      </div>
    </div>
  );
}
