/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#FDEEF4',
        ink: '#2A1830',
        cream: '#FFF8EE',
        blush: '#B45A86',
        pink: {
          DEFAULT: '#FF5BA8',
          hover: '#FF4A9C',
          soft: '#FFE4F1',
          muted: '#E8A0C0',
          deep: '#E23D86',
        },
        success: '#2FA85A',
        danger: '#E23B4A',
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        pixel: ['"Pixelify Sans"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        block: '4px 4px 0 0 #2A1830',
        'block-sm': '3px 3px 0 0 #2A1830',
        'block-lg': '6px 6px 0 0 #2A1830',
        'block-pink': '5px 5px 0 0 #F5B6D4',
      },
      letterSpacing: {
        ui: '0.06em',
      },
    },
  },
  plugins: [],
}
