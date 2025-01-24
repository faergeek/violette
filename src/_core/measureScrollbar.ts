const scrollbarContainer = document.createElement('div');
scrollbarContainer.style.width = '100%';
scrollbarContainer.style.height = '100%';
scrollbarContainer.style.overflow = 'scroll';
scrollbarContainer.style.position = 'absolute';
scrollbarContainer.style.inset = '0';
scrollbarContainer.style.zIndex = '-9999';
scrollbarContainer.style.visibility = 'hidden';
document.body.appendChild(scrollbarContainer);

const resizeObserver = new ResizeObserver(entries => {
  const [
    {
      borderBoxSize: [borderBoxSize],
      contentBoxSize: [contentBoxSize],
    },
  ] = entries;

  document.documentElement.style.setProperty(
    '--scrollbar-inline-size',
    `${borderBoxSize.inlineSize - contentBoxSize.inlineSize}px`,
  );

  document.documentElement.style.setProperty(
    '--scrollbar-block-size',
    `${borderBoxSize.blockSize - contentBoxSize.blockSize}px`,
  );
});

resizeObserver.observe(scrollbarContainer);
