use regex::Regex;
use std::process::Command;
use std::str::FromStr;

use alloy::primitives::Address;

/// Build, check, and deploy the contract via `cargo stylus`, then return
/// the deployed address parsed out of the tool's stdout.
///
/// Surfaces stdout/stderr from `cargo stylus` on failure so test logs are
/// actionable rather than swallowed.
pub async fn setup(priv_key: &str, rpc_url: &str) -> eyre::Result<Address> {
    println!("cargo stylus check --endpoint={} ...", rpc_url);

    let check_output = Command::new("cargo")
        .arg("stylus")
        .arg("check")
        .arg(format!("--endpoint={}", rpc_url))
        .output()
        .expect("Failed to execute `cargo stylus check`");

    if !check_output.status.success() {
        eprintln!("`cargo stylus check` failed: {}", check_output.status);
        eprintln!(
            "stdout:\n{}",
            String::from_utf8_lossy(&check_output.stdout)
        );
        eprintln!(
            "stderr:\n{}",
            String::from_utf8_lossy(&check_output.stderr)
        );
        return Err(eyre::eyre!("stylus check failed"));
    }

    println!("cargo stylus deploy --endpoint={} ...", rpc_url);

    let deploy_output = Command::new("cargo")
        .arg("stylus")
        .arg("deploy")
        .arg(format!("--endpoint={}", rpc_url))
        .arg(format!("--private-key={}", priv_key))
        .arg("--no-verify")
        .output()
        .expect("Failed to execute `cargo stylus deploy`");

    if !deploy_output.status.success() {
        eprintln!("`cargo stylus deploy` failed: {}", deploy_output.status);
        eprintln!(
            "stdout:\n{}",
            String::from_utf8_lossy(&deploy_output.stdout)
        );
        eprintln!(
            "stderr:\n{}",
            String::from_utf8_lossy(&deploy_output.stderr)
        );
        return Err(eyre::eyre!("stylus deploy failed"));
    }

    // cargo-stylus prints, among ANSI escapes:
    //   deployed code at address: 0x...
    let stdout = String::from_utf8_lossy(&deploy_output.stdout);
    let ansi = Regex::new(r"\u{1b}\[[0-9;]*[a-zA-Z]")
        .expect("ansi regex compiles");
    let clean = ansi.replace_all(&stdout, "");
    let address_re =
        Regex::new(r"deployed code at address:\s*(0x[a-fA-F0-9]{40})")
            .expect("address regex compiles");

    match address_re.captures(&clean) {
        Some(caps) => Ok(Address::from_str(&caps[1])
            .expect("captured deployed address is valid hex")),
        None => {
            eprintln!("Could not parse deployed address from:\n{}", clean);
            Err(eyre::eyre!(
                "could not find `deployed code at address:` in stylus deploy output"
            ))
        }
    }
}
