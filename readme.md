# useAnchor

`useAnchor` is a custom React hook that helps you create dynamic anchor links for headings in your content. It uses the Intersection Observer API to detect which headings are currently visible in the viewport, making it perfect for creating table of contents or navigation systems for long-form content.

## Installation

```bash
npm install use-anchor-hook@latest
```

## Usage

Here's a basic example of how to use the useAnchor hook:

```javascript
import React from 'react';
import useAnchor from 'use-anchor-hook';

function MyComponent() {
  const [containerRef, visibleIds, headings] = useAnchor({ heading: 'h2' });

  return (
    <div>
      <nav>
        {headings.map(heading => (
          <a 
            key={heading.id} 
            href={`#${heading.id}`} 
            /* Multiple sections may be visible in the viewport simultaneously.
              The visibleIds array is ordered according to their position from top to bottom.
              Therefore, visibleIds[0] will always represent the first section visible in the viewport.
            */
            style={{ fontWeight: visibleIds[0] ? 'bold' : 'normal' }}
          >
            {heading.text}
          </a>
        ))}
      </nav>

      <div ref={containerRef}>
        <h2 id="section1">Section 1</h2>
        <p>Content for section 1...</p>
        <h2 id="section2">Section 2</h2>
        <p>Content for section 2...</p>
        {/* More sections... */}
      </div>
    </div>
  );
}
```

## API

### useAnchor(options)

The useAnchor hook accepts an options object and returns an array with three elements:

containerRef: A ref object to be attached to the container of your content.
visibleIds: An array of IDs of the currently visible headings, sorted by their position in the viewport.
headings: An array of all heading IDs and text content in the order they appear in the document.

#### Options

The hook accepts the following options:

**heading (optional)**: The heading tag to observe. Default is 'h2'. Can be 'h1', 'h2', 'h3', 'h4', or 'h5'.

**options (optional)**: An object with Intersection Observer options:

- root: The root element to use as the viewport. Default is the browser viewport.
- rootMargin: Margin around the root element. Default is '0px'.
- threshold: A number or array of numbers indicating at what percentage of the target's visibility the observer's callback should be executed. Default is 0.

## How It Works

The hook creates an Intersection Observer to watch for heading elements that enter or leave the viewport.
It attaches this observer to all heading elements (of the specified type) within the container element.
As headings become visible or hidden, the hook updates its state.
The hook returns both the currently visible heading IDs and all heading IDs, allowing you to create dynamic navigation that highlights the current section.

## Best Practices

Ensure that all your observed heading elements have unique id attributes.
Attach the containerRef to the parent element that contains all your headings.
Use the visibleIds array to highlight the currently visible sections in your navigation.
Use the headings array to create a complete list of all sections.

## Troubleshooting

If you're not seeing any IDs in the visibleIds or headings arrays:

Make sure your heading elements have id attributes.
Check that you're using the correct heading type (e.g., 'h2' if that's what you specified in the options).
Ensure that the containerRef is correctly attached to the parent element of your headings.

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## License

This project is licensed under the **MIT** License.

