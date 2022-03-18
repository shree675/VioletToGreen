<!-- script is required for compilation -->
<script lang="ts">
  import { onMount } from "svelte";

  let deleteIconSrc =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KIDx0aXRsZS8+CgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI0MDIiIHdpZHRoPSI1ODIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGZpbGw9IiNhMDFjMWMiIGlkPSJzdmdfMSIgZD0ibTM1Ni42NSw0NTBsLTE4NS4xOCwwYTQxLDQxIDAgMCAxIC00MC45LC00MC45bDAsLTI4OC40NGExNSwxNSAwIDAgMSAxNSwtMTVsMjM3LDBhMTUsMTUgMCAwIDEgMTUsMTVsMCwyODguNDRhNDEsNDEgMCAwIDEgLTQwLjkyLDQwLjl6bS0xOTYuMDgsLTMxNC4zNGwwLDI3My40NGExMC45MSwxMC45MSAwIDAgMCAxMC45LDEwLjlsMTg1LjE4LDBhMTAuOTEsMTAuOTEgMCAwIDAgMTAuOTEsLTEwLjlsMCwtMjczLjQ0bC0yMDYuOTksMHoiLz4KICA8cGF0aCBmaWxsPSIjYTAxYzFjIiBpZD0ic3ZnXzIiIGQ9Im0zMjcuMDYsMTM1LjY2bC0xMjYsMGExNSwxNSAwIDAgMSAtMTUsLTE1bDAsLTI3LjI2YTQ0Ljc5LDQ0Ljc5IDAgMCAxIDQ0Ljc0LC00NC43M2w2Ni41MiwwYTQ0Ljc5LDQ0Ljc5IDAgMCAxIDQ0Ljc0LDQ0LjczbDAsMjcuMjZhMTUsMTUgMCAwIDEgLTE1LDE1em0tMTExLC0zMGw5NiwwbDAsLTEyLjI2YTE0Ljc1LDE0Ljc1IDAgMCAwIC0xNC43NCwtMTQuNzNsLTY2LjUyLDBhMTQuNzUsMTQuNzUgMCAwIDAgLTE0LjczLDE0LjczbC0wLjAxLDEyLjI2eiIvPgogIDxwYXRoIGZpbGw9IiNhMDFjMWMiIGlkPSJzdmdfMyIgZD0ibTI2NC4wNiwzOTIuNThhMTUsMTUgMCAwIDEgLTE1LC0xNWwwLC0xOTkuNDlhMTUsMTUgMCAxIDEgMzAsMGwwLDE5OS40OWExNSwxNSAwIDAgMSAtMTUsMTV6Ii8+CiAgPHBhdGggZmlsbD0iI2EwMWMxYyIgaWQ9InN2Z182IiBkPSJtNDA1LjgxLDEzNS42NmwtMjgzLjQ5LDBhMTUsMTUgMCAwIDEgMCwtMzBsMjgzLjQ5LDBhMTUsMTUgMCAwIDEgMCwzMHoiLz4KIDwvZz4KPC9zdmc+";

  var list = [
    ["First element", "Second element"],
    ["Third element", "Fourth element"],
    ["Fifth element", "Sixth element"],
    ["Seventh element", "Eighth element"],
    ["Ninth element", "Tenth element"],
    ["Eleventh element", "Twelfth element"],
    ["Thirteenth element", "Fourteenth element"],
    ["Fifteenth element", "Sixteenth element"],
    ["Seventeenth element", "Eighteenth element"],
    ["Nineteenth element", "Twentieth element"],
    ["Twenty-first element", "Twenty-second element"],
    ["Twenty-third element", "Twenty-fourth element"],
    ["Twenty-fifth element", "Twenty-sixth element"],
    ["Twenty-seventh element", "Twenty-eighth element"],
    ["Twenty-ninth element", "Thirty-first element"],
  ];

  const handleRemove = (index: any) => {
    list.splice(index, 1);
    refs.splice(index, 1);
    list = list;
  };

  let _refs: any[] = [];
  $: refs = _refs.filter((el) => el);

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "requestForLinks") {
        console.log("value:", message.value);
      }
    });
  });
</script>

{#each list as item}
  <div class="container-item">
    <div class="main-item" bind:this={_refs[list.indexOf(item)]}>
      <span class="title">Link {list.indexOf(item) + 1}</span>
      <img
        class="main-img"
        src={deleteIconSrc}
        alt="delete"
        on:click={() => {
          handleRemove(list.indexOf(item));
        }}
      />
    </div>
    <div>
      <div class="blue">{item[0]}</div>
      <div class="green">{item[1]}</div>
    </div>
  </div>
{/each}

<style>
  .container-item {
    margin-bottom: 10px;
  }
  .blue {
    background-color: rgba(0, 0, 255, 0.151);
    cursor: pointer;
    padding: 2px;
  }
  .green {
    background-color: rgba(0, 255, 0, 0.151);
    cursor: pointer;
    padding: 2px;
  }
  .main-item {
    background-color: rgba(0, 0, 0, 0.151);
    width: 100%;
    padding: 2px;
    border: 1px solid rgba(0, 0, 0);
  }
  .main-img {
    width: 18px;
    height: 18px;
    float: right;
    cursor: pointer;
  }
  .title {
    padding: 2px;
  }
</style>
