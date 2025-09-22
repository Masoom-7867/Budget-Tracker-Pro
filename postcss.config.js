// // ✅ Updated postcss.config.js
// module.exports = {
//   plugins: [
//     require('@tailwindcss/postcss'),
//     require('autoprefixer'),
//   ],
// };



module.exports = {
    plugins: {
      "tailwindcss/nesting": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  