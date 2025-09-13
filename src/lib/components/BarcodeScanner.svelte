<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Html5QrcodeScanner } from 'html5-qrcode';

  export let onScan: (barcode: string) => void;
  export let onError: (error: string) => void;

  let scanner: Html5QrcodeScanner;
  let scannerId = 'qr-reader';

  onMount(() => {
    scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1,
        disableFlip: false,
        videoConstraints: {
          facingMode: { ideal: 'environment' }
        }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        onError(errorMessage);
      }
    );
  });

  onDestroy(() => {
    if (scanner) {
      scanner.clear();
    }
  });
</script>

<div class="barcode-scanner">
  <div id={scannerId}></div>
</div>

<style>
  .barcode-scanner {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  :global(#qr-reader) {
    width: 100% !important;
  }

  :global(#qr-reader__scan_region) {
    background: white;
  }

  :global(#qr-reader__dashboard) {
    padding: 0 !important;
  }
</style>