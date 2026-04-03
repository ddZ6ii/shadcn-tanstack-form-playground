function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function capitalize(str: string) {
  return str.split(' ').map(capitalizeWord).join(' ')
}

export default capitalize
