/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ejs,tsx}'],
  theme: {
    spacing: buildSpacing(100),
    fontSize: {
      ssm: ['10px', '14px'],
      sm: ['12px', '17px'],
      md: ['14px', '20px'],
      lg: '16px',
      xl: '20px',
      // 2xl: '24px',
      // 3xl: '28px'
    },
    colors: {
      secondary: '#9192a0',
      primary: '#DDDEEF',
      gray: 'rgba(148,163,184,0.08)',
      'light-gray': '#32343e'

    },
  },
  variants: {},
  plugins: [
    // ...
  ],
  base: {},
  corePlugins: {
    float: false,
    container: false,
    preflight: false,
  },
};

function buildSpacing(max) {
  return Array(max)
    .fill(0)
    .reduce((res, _, index) => {
      res[`${index}`] = `${index}px`;
      return res;
    }, {});
}
