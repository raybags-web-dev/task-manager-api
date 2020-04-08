
const fahrenheitToCelsius = (temp) => (temp - 32) / 1.8

const celsiusToFahrenheit = (temp) => (temp * 1.8) + 32;

const calculateTip = (total, tipPercentage = .2) => (total * tipPercentage) + total;

module.exports = {
   calculateTip,
   fahrenheitToCelsius,
   celsiusToFahrenheit
}