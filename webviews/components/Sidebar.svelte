<script lang="ts">
  import { onMount } from "svelte";

  var count = 0;
  var text = "";

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "response") {
        text = message.value;
      }
    });
  });
</script>

<div>{count}</div>
<button
  on:click={() => {
    count++;
  }}>Increment</button
>

<input type="text" bind:value={text} />

<button
  on:click={() => {
    tsvscode.postMessage({
      type: "request",
      value: "Request to obtain selected text",
    });
  }}>Select Text</button
>

<button
  on:click={() => {
    tsvscode.postMessage({ type: "info", value: "Hello from the webview" });
  }}>Information</button
>

<button
  on:click={() => {
    tsvscode.postMessage({ type: "error", value: "Error in the webview" });
  }}>Error</button
>

<style>
  div {
    color: white;
  }
</style>
