export const capitaliseFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function limitString(str: string, maxLength: number) {
    if (str.length <= maxLength) return str;
    
  
    const sideLength = maxLength / 2;
    const beginning = str.substring(0, sideLength);
    const end = str.substring(str.length - sideLength, str.length);
  
    return `${beginning} ... ${end}`;
}
