// Déclarations TypeScript globales pour les éléments personnalisés

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'camera-orbit'?: string;
        'field-of-view'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'min-field-of-view'?: string;
        'max-field-of-view'?: string;
        'interaction-prompt'?: string;
        'interaction-prompt-style'?: string;
        'interaction-prompt-threshold'?: string;
        loading?: string;
        reveal?: string;
        'shadow-intensity'?: string;
        'shadow-softness'?: string;
        'environment-image'?: string;
        skyboxImage?: string;
        exposure?: string;
        'touch-action'?: string;
        scale?: string;
        style?: React.CSSProperties;
        className?: string;
        onLoad?: () => void;
        onError?: (event: any) => void;
      };
    }
  }
}

export {};