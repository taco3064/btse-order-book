import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { OrderBookList } from '~bob/containers';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OrderBookList entryCount={8} orderCode="BTCPFC" />
  </StrictMode>,
);
