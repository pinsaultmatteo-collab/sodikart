# SODIKART — Refonte du site (maquette fonctionnelle)

Site statique prêt à présenter : 7 pages, animations GSAP, globe 3D Three.js, SVG dynamiques.
Construit à partir de la fiche de référence `contexte/sodikart-fiche-reference.md` (architecture par intention de visite, 3 portes d'entrée, devis en 3 étapes).

## Ouvrir le site

Double-cliquer sur `site/index.html` (connexion Internet nécessaire : polices Google, GSAP, Lenis et Three.js sont chargés depuis des CDN).
Pour un rendu identique à l'hébergement final, servir le dossier `site/` :

```bash
cd site && python3 -m http.server 8765
```

puis ouvrir http://localhost:8765/.

## Pages

| Fichier | Rôle | Points forts |
|---|---|---|
| `index.html` | Accueil | Preloader « feux de départ », hero, 3 portes d'entrée, chaîne de valeur (circuit SVG animé), SR6 en hotspots 3D, pilier électrique (jauge + SODISCAN), gamme en défilement horizontal, compétition (vidéo SRT), globe 3D du réseau, SWS, 15 étapes, service, actualités, CTA devis |
| `karts-location.html` | Karts de location SODI | Gamme filtrable (11 karts), pilier électrique, fiche SR6 avec galerie et specs, glossaire des 82 technologies, sécurité UTAC, comparateur 3 karts (interactif), My Studio (démo couleurs), Sodi Restart |
| `competition.html` | SODI Racing | Échelle d'âge Nova → Sigma KZ, fiche Sigma KZ, Sodi Racing Team (vidéo), palmarès, Rotax France, école, revendeurs |
| `solutions-circuits.html` | Exploitants & porteurs de projet | 3 concepts, 15 étapes en accordéon, **simulateur de rentabilité interactif**, flotte, pièces, logiciels, service, références, guide |
| `communaute.html` | Sodi World Series | Comment ça marche, finales, événements 3MK, **carte SVG des 760 pistes** avec recherche, partenaires |
| `groupe.html` | Groupe | Frise 1981→2030 (défilement horizontal), usine, arbre des marques (SVG interactif), direction, RSE en 5 chiffres, presse, carrières, devenir revendeur |
| `devis.html` | Devis en 3 étapes | Profil → besoin → coordonnées, pré-rempli depuis les fiches (`?profil=…&kart=…`) |

## Charte

- Logo SODIKART existant, vectorisé (`site/assets/logo/*.svg`) à partir du PNG du site actuel.
- Couleurs du site actuel : orange `#FF5220`, noir carbone, teal `#3AB8B8` (réservé à la ligne électrique).
- Typographies : la charte utilise Magistral/Transducer (Adobe Fonts, licence payante). La maquette utilise des équivalents libres : Saira Extra Condensed (titres), Saira (UI), Inter (texte). À remplacer par Magistral si Sodikart fournit la licence Typekit.
- Photos : issues du site sodikart.com et de sodiwseries.com (converties en WebP). Les photos d'actualités sont en basse définition (500 px) : prévoir les originaux pour la mise en production.

## Ce qui est en démonstration

- Formulaires (devis, guide) : aucune donnée envoyée, écran de confirmation simulé.
- Classement SWS « en direct » en page d'accueil : pseudonymes issus de l'écran de chronométrage du site actuel, temps animés.
- Carte des pistes : positions approximatives générées autour de pôles par pays ; à connecter au localisateur réel.
- Packs Sodi Restart : contenu indicatif, à préciser avec Sodikart.
- Simulateur : calcul indicatif (karts × sessions × jours × remplissage × prix).

## Chiffres à valider avec le client (voir fiche, section 11)

Années d'expérience (45 ans = 1981→2026), circuits équipés (« plus de 1 000 »), pays (46 au localisateur / 85-100 revendiqués), CA (~80 M€) et effectif (170), parts de marché (non affichées), garantie, délais, prix, statut de Game of Karts.

## Modifier les pages

Les pages intérieures sont générées depuis `_src/pages/*.html` (contenu) et les blocs partagés de `site/index.html` (sprite, loader, nav, footer) :

```bash
python3 _src/build.py
```

Fichiers clés : `site/assets/css/main.css` (design system), `site/assets/js/main.js` (preloader, nav, scroll, reveals), `home.js` (accueil), `globe.js` (globe 3D), `pages.js` (comparateur, simulateur, carte, devis), `land.js` (points du planisphère).

## Hébergement

Dossier `site/` à déposer tel quel sur n'importe quel hébergement statique (Netlify, Vercel, OVH, S3…). Pas de build ni de serveur applicatif nécessaire.
