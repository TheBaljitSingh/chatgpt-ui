const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

if(typeof config ==='undefined'){
    throw new Error('PostCSS config is undefined (make sure to export an function or object from config file)');
}
export default config;