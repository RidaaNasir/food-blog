module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'pastel-pink': {
          100: '#FFE5EC',
          200: '#FFCCD5',
          300: '#FFB3C1',
          400: '#FF99AC',
          500: '#FF8096',
          600: '#FF6680',
          700: '#FF4D6A',
          800: '#FF3355',
          900: '#FF1A40',
        },
        'dark': {
          100: '#4A4A4A',
          200: '#3D3D3D',
          300: '#303030',
          400: '#242424',
          500: '#171717',
          600: '#0A0A0A',
          700: '#000000',
        },
        'food': {
          'cream': '#FFF8E1',
          'mint': '#E0F2F1',
          'berry': '#F8BBD0',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Montserrat', 'sans-serif'],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '2000': '2000ms',
      }
    },
  },
  plugins: [],
  corePlugins: {
    lineClamp: true,
  }
};
