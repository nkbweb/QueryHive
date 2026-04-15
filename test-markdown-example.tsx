// This is a test file to show how mixed content renders

const exampleContent = `Here's some regular text to start with.

This is inline code: \`console.log('hello')\` and here's more text.

Here's a code block:
\`\`\`javascript
function example() {
  return "This is a code block";
}
\`\`\`

And now more text after the code block.

You can also use \`inline.code()\` multiple times in the same paragraph.

Another code block:
\`\`\`python
def hello():
    print("Hello from Python")
\`\`\`

Final text with more \`inlineCode()\` examples.`

// How this will render:
// 1. Regular paragraphs will be normal text
// 2. Inline code (backticks) will be highlighted with green/lime color
// 3. Code blocks (triple backticks) will be in dark containers with monospace font
// 4. Everything maintains proper spacing and flow
