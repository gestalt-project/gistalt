module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',

        'blue': '#2196F3',
        'theme-blue': '#2696F1',
        'highlight-purple': '#9990FF',
        'highlight-orange': '#FF7551',
        'base-gray': '#222230',
        'mid-gray': '#353340',
        'light-gray': '#9E9E9E',
        'github-gray': '#181c24',
        'github-gray2': '#101414',

      },
      
      fontFamily: {
      'sans': ['ui-sans-serif', 'system-ui'],
      'serif': ['ui-serif', 'Georgia'],
      'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas']
    }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
