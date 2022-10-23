let value = '{{address.name}} {{ address.city }}'
const match = value.matchAll(/{{\s*(.*?)\s*}}/g)
console.log(Array.from(match))
