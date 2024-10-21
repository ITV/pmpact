# Release Process for New Versions

> [!IMPORTANT]
> Reminder: this repository is publicly listed package on npm – [PMPact on npm](https://www.npmjs.com/package/pmpact).

Follow this release process:

1. Make your changes.
2. Test.
3. ✅ Get reviews and sign off.
4. **Squash and merge** into `main` branch.
5. On `main` branch – do `npm version patch`.
   - Push commit created to GitHub – _you may need `main` branch to be temporarily un-protected_.
   - Push tag created to GitHub.
6. Publish code and tag to [npm](https://www.npmjs.com/).
   - You will need an npm account.
   - You will need to be added to the relevant team/organisation.
