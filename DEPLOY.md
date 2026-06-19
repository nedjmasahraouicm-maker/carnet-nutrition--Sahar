# Déploiement Netlify

Projet créé : **carnet-suivi-sahar**
- URL future : https://carnet-suivi-sahar.netlify.app
- Site ID : `4130259e-bfdd-436a-8924-494c7944d57e`
- Dashboard : https://app.netlify.com/projects/carnet-suivi-sahar

## 3 chemins pour mettre le site en ligne

### A. Connecter le repo GitHub (recommandé — auto-déploiement)

1. Aller sur https://app.netlify.com/projects/carnet-suivi-sahar/settings/deploys
2. Section « Continuous deployment » → **Link repository** → GitHub
3. Choisir le repo `nedjmasahraouicm-maker/carnet-nutrition--sahar`
4. Branche `claude/wizardly-ritchie-2rht1f` (ou merge vers `main` d'abord)
5. Build command : *(laisser vide)*, Publish directory : *(laisser vide / `.`)*
6. Deploy ! Chaque push redéploie automatiquement.

### B. Drag & drop manuel (le plus rapide)

1. Télécharger le dossier du repo en zip ou cloner localement.
2. Aller sur https://app.netlify.com/projects/carnet-suivi-sahar/deploys
3. Glisser le dossier dans la zone « Drag and drop your site output folder here ».

### C. CLI Netlify depuis ta machine

```bash
git clone <le-repo>
cd carnet-nutrition--Sahar
npx netlify-cli deploy --prod --dir=. --site=4130259e-bfdd-436a-8924-494c7944d57e
# (te demande de te logger la première fois)
```

## Configuration Supabase à finaliser

Aller sur https://supabase.com/dashboard/project/rjfqxdmyrjwviijicnlu/functions → `api` → Secrets,
et ajouter :

- `CARNET_AUTH_SECRET` = un secret aléatoire de 48+ caractères (générer : `openssl rand -base64 48`)
- `CARNET_INITIAL_COACH_PASSWORD` = ton mot de passe coach (à changer ensuite via l'UI)

Sans `CARNET_AUTH_SECRET` custom, les tokens utilisent un secret par défaut publiquement connu — **à faire avant tout vrai usage**.
