<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { usePlayer } from "./usePlayer.js";

const player = usePlayer();
const { snapshot, error, status, connected, busy, local, ready, signedIn } = player;
const displayName = ref("");
const confirmation = ref("");
const animals = {
  tiger: "Bengal tiger", lion: "African lion", bear: "Brown bear",
  hippo: "Hippopotamus", rhino: "White rhinoceros", crocodile: "Nile crocodile",
};
watch(() => snapshot.value?.account.displayName, name => { displayName.value = name ?? ""; });
onMounted(() => { void player.initialize(); });
</script>

<template>
  <main>
    <header>
      <div>
        <p class="eyebrow">Animal VS / Core platform</p>
        <h1>Your contenders.<br>Your progress.</h1>
        <p class="intro">A persistent home for your roster. Battles and facility actions are coming next.</p>
      </div>
      <div class="session">
        <p role="status">{{ status }}</p>
        <button v-if="signedIn" @click="player.signOut">Sign out</button>
      </div>
    </header>

    <div v-if="error" role="alert" class="error">{{ error }}</div>

    <section v-if="!signedIn" class="panel">
      <h2>Welcome to your roster</h2>
      <p>Sign in to load saved progress. No guest progress or browser saves are used.</p>
      <template v-if="local">
        <p class="notice">Local development only. These identities are not valid in production.</p>
        <div class="actions">
          <button :disabled="!ready" @click="player.start('one')">Use local player one</button>
          <button :disabled="!ready" @click="player.start('two')">Use local player two</button>
        </div>
      </template>
      <button v-else :disabled="!ready" @click="player.signIn">Sign in with Microsoft</button>
    </section>

    <template v-if="snapshot">
      <section class="summary" aria-label="Account overview">
        <div class="panel"><h2>{{ snapshot.account.displayName }}</h2><p>Server revision {{ snapshot.account.revision }}</p></div>
        <div class="panel"><h2>{{ snapshot.account.economy.credits }} credits</h2><p>{{ snapshot.account.economy.turns }} management turns</p></div>
        <div class="panel"><h2>UTC reset</h2><p>Last processed: {{ snapshot.account.economy.lastResetDate }}</p></div>
      </section>

      <section aria-labelledby="roster-title">
        <div class="section-title"><h2 id="roster-title">Your collection</h2><span>Six starter contenders</span></div>
        <ul class="roster">
          <li v-for="animal in snapshot.account.animals" :key="animal.animalId" class="panel animal">
            <span class="animal-mark" aria-hidden="true">{{ animal.animalId.slice(0, 2).toUpperCase() }}</span>
            <h3>{{ animals[animal.animalId] }}</h3>
            <p>Level {{ animal.level }} · {{ animal.residualXp }} XP</p>
            <p>Welfare {{ animal.welfare }}/100</p>
            <p class="muted">Last training: {{ animal.lastTrainingDate ?? 'Not trained' }}</p>
          </li>
        </ul>
      </section>

      <section class="summary">
        <div class="panel">
          <h2>Facilities</h2>
          <p v-if="!snapshot.account.facilities.length">No facilities built yet.</p>
          <ul><li v-for="facility in snapshot.account.facilities" :key="facility.facilityId">{{ facility.facilityId }} · Level {{ facility.level }}</li></ul>
          <p>{{ snapshot.account.pendingPurchases.length }} pending purchases</p>
        </div>
        <div class="panel">
          <h2>Battle recovery</h2>
          <p>{{ snapshot.pendingBattles.length }} stored pending battles</p>
          <p v-if="!snapshot.battles.length">No completed battles yet.</p>
          <details v-for="battle in snapshot.battles" :key="battle.id">
            <summary>{{ battle.mode === 'cpu' ? 'CPU' : 'Human' }} battle · {{ battle.outcome }}</summary>
            <ol><li v-for="event in battle.events" :key="event.sequence">{{ event.text }}</li></ol>
          </details>
          <p class="muted">Recovery reads recorded results. It never simulates or awards twice.</p>
        </div>
      </section>

      <section class="panel">
        <h2>Account settings</h2>
        <form @submit.prevent="player.saveName(displayName)">
          <label for="display-name">Display name (not your real name)</label>
          <div class="actions">
            <input id="display-name" v-model="displayName" maxlength="40" required autocomplete="nickname">
            <button :disabled="busy || !connected" type="submit">Save display name</button>
          </div>
        </form>
        <details class="deletion">
          <summary>Delete application data</summary>
          <p>This permanently removes progress and account-linked battle history. Your Microsoft identity and expiring backups are managed separately.</p>
          <label for="delete-confirmation">Type DELETE to confirm</label>
          <div class="actions">
            <input id="delete-confirmation" v-model="confirmation" autocomplete="off">
            <button class="danger" :disabled="confirmation !== 'DELETE' || busy || !connected" @click="player.deleteAccount">Delete my application data</button>
          </div>
        </details>
      </section>
    </template>
    <footer>Server-authoritative progression · Stylized, non-graphic gameplay · Platform preview</footer>
  </main>
</template>

<style>
:root { font-family: system-ui, sans-serif; color: #eef4ed; background: #101914; line-height: 1.6; }
* { box-sizing: border-box; }
body { margin: 0; }
main { max-width: 1160px; margin: auto; padding: 48px 24px; }
header { display: flex; justify-content: space-between; gap: 24px; padding: 16px 0 42px; }
h1 { font-size: clamp(2.4rem, 6vw, 4.5rem); line-height: 1.08; letter-spacing: -.04em; margin: 12px 0 24px; }
h2 { font-size: 1.25rem; margin: 0 0 12px; }
h3 { font-size: 1.1rem; margin: 16px 0 6px; }
p { margin: 8px 0; }
.eyebrow { color: #b7d791; text-transform: uppercase; letter-spacing: .15em; font-weight: 700; font-size: .8rem; }
.intro, .muted, footer, .section-title span { color: #becbbf; }
.intro { max-width: 540px; }
.session { min-width: 190px; text-align: right; padding-top: 16px; }
.panel { padding: 24px; background: #1a2920; border: 1px solid #3a5140; border-radius: 12px; margin-bottom: 24px; }
.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px; }
.section-title { display: flex; gap: 20px; justify-content: space-between; margin: 16px 0; }
.roster { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; list-style: none; padding: 0; }
.animal { margin: 0; }
.animal-mark { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: #304b36; color: #d3ecaf; border-radius: 9px; font-size: 1rem; font-weight: 800; letter-spacing: .1em; }
section { margin-bottom: 24px; }
button, input { font: inherit; border-radius: 6px; min-height: 44px; padding: 9px 16px; }
button { cursor: pointer; border: 1px solid #c5df9e; background: #c5df9e; color: #152313; font-weight: 650; }
button:disabled { cursor: not-allowed; opacity: .55; }
input { background: #101914; color: #eef4ed; border: 1px solid #78917b; min-width: 0; }
label { display: block; margin: 12px 0 8px; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; }
.actions input { flex: 1 1 200px; }
:focus-visible { outline: 3px solid #f8d287; outline-offset: 4px; }
.error { border: 1px solid #f2a394; color: #ffe1d9; background: #402820; padding: 18px; border-radius: 8px; margin-bottom: 24px; }
.notice { color: #f8d287; margin: 20px 0; }
.deletion { margin-top: 28px; border-top: 1px solid #526454; padding-top: 20px; }
summary { cursor: pointer; padding: 6px 0; }
.danger { color: #ffdfd7; background: #542f25; border-color: #e5a292; }
footer { font-size: .85rem; margin-top: 40px; }
@media (max-width: 600px) {
  main { padding: 24px 16px; }
  header, .section-title { flex-direction: column; }
  .session { text-align: left; }
}
</style>
