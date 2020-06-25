export default function removePropertyFromObject(
  property: string | string[],
  object: Record<string, string>,
): Record<string, string> {
  const cloneObject = object;

  if (property instanceof Array) {
    Object.keys(object).forEach(key => {
      if (property.includes(key)) {
        delete cloneObject[key];
      }
    });
  } else {
    Object.keys(object).forEach(key => {
      if (key.indexOf(property) >= 0) {
        delete cloneObject[key];
      }
    });
  }

  return cloneObject;
}
