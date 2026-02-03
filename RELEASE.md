# Release Process for New Versions

> [!IMPORTANT]
> Reminder: this repository is publicly listed package on npm – [PMPact on npm](https://www.npmjs.com/package/pmpact).

> [!NOTE]
> The following process is primarily aimed at internal contributors. However, if you wish to contribute to this repository you are more than welcome; please do reach out and open a PR.


## Automated Release Checks ( Recommended )

- Once your changes are ready to be merged into `main` branch, open a PR.
- You must bump the version in `package.json`. The [Version Check GitHub Action](.github/workflows/version-check.yml) will verify that the version tag does not already exist.
- [Tests](.github/workflows/test.yml) will run automatically via GitHub Actions for each commit in the PR.
- Once approved, `squash and merge` the PR into `main` branch.
- Once merged the [Release GitHub Action](.github/workflows/release.yml) will automatically publish the new version to [npm](https://www.npmjs.com/).

## Manual Release Process

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
