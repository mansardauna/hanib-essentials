module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f7',
          100: '#daebea',
          200: '#b8d8d7',
          300: '#8cbebc',
          400: '#5da09b', // Main brand color (teal)
          500: '#468581',
          600: '#386a68',
          700: '#2f5655',
          800: '#284746',
          900: '#243b3a',
          peach: '#f5a073',
          peachHover: '#e58e60',
        },
        vibrant: {
          pink: '#ff4d85',
          orange: '#ff8a4c',
          yellow: '#ffcc4d',
          purple: '#a64dff'
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #5da09b 0%, #386a68 100%)',
        'gradient-peach': 'linear-gradient(135deg, #f5a073 0%, #e58e60 100%)',
        'gradient-colorful': 'linear-gradient(135deg, #ffcc4d 0%, #ff8a4c 50%, #ff4d85 100%)',
        'gradient-soft': 'linear-gradient(to right top, #f0f7f7, #daebea, #fff3e0, #ffebee)',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
