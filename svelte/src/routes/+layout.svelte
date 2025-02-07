<script>
    import "../app.css";

    const assignment_number = "05";
    const name = "Sharanya G S"; 
</script>
<style>
    .title-text{
        
        color: #e85a4f;
    }
</style>

<nav>
    <img src="/favicon.png" alt="logo" id="logo" />
    <span>
        <div class="title-text">
        <b>Is buying a property in New York worth it?</b>
        </div>
    </span>
    <span class="divider" />
    <span>{name}</span>
</nav>
<main>
    <slot />
</main>
