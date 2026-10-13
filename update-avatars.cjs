const fs = require('fs');
let data = fs.readFileSync('src/lib/initialData.ts', 'utf8');

const urls = [
  "https://image.pollinations.ai/prompt/portrait-of-a-smart-young-indian-muslim-boy-student-wearing-kufi-cap-smiling-photorealistic?width=500&height=500&nologo=true&seed=1",
  "https://image.pollinations.ai/prompt/portrait-of-a-confident-young-south-asian-muslim-boy-student-wearing-kufi-cap-photorealistic?width=500&height=500&nologo=true&seed=2",
  "https://image.pollinations.ai/prompt/portrait-of-a-friendly-young-indian-muslim-boy-student-wearing-kufi-cap-and-glasses-photorealistic?width=500&height=500&nologo=true&seed=3",
  "https://image.pollinations.ai/prompt/portrait-of-a-young-indian-muslim-boy-student-wearing-traditional-cap-photorealistic?width=500&height=500&nologo=true&seed=4",
  "https://image.pollinations.ai/prompt/portrait-of-a-cheerful-young-south-asian-muslim-boy-student-wearing-kufi-cap-photorealistic?width=500&height=500&nologo=true&seed=5",
  "https://image.pollinations.ai/prompt/portrait-of-a-young-indian-muslim-boy-student-wearing-kufi-cap-outdoor-lighting-photorealistic?width=500&height=500&nologo=true&seed=6",
  "https://image.pollinations.ai/prompt/portrait-of-a-studious-young-south-asian-muslim-boy-student-wearing-kufi-cap-photorealistic?width=500&height=500&nologo=true&seed=7",
  "https://image.pollinations.ai/prompt/portrait-of-a-young-indian-muslim-boy-student-wearing-kufi-cap-studio-lighting-photorealistic?width=500&height=500&nologo=true&seed=8",
  "https://image.pollinations.ai/prompt/portrait-of-a-handsome-young-south-asian-muslim-boy-student-wearing-kufi-cap-photorealistic?width=500&height=500&nologo=true&seed=9",
  "https://image.pollinations.ai/prompt/portrait-of-a-young-indian-muslim-boy-student-wearing-kufi-cap-bright-smile-photorealistic?width=500&height=500&nologo=true&seed=10"
];

let index = 0;
data = data.replace(/avatarUrl: '.*?'/g, (match) => {
  if (index < urls.length) {
    const replacement = `avatarUrl: '${urls[index]}', // AI Generated Muslim Boy`;
    index++;
    return replacement;
  }
  return match; // fallback if more than 10
});

fs.writeFileSync('src/lib/initialData.ts', data);
console.log('Avatars updated');
