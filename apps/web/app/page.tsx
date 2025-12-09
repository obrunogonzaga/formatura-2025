"use client";

import { useMemo, useState } from "react";

type ChildForm = {
  id: string;
  name: string;
  files: File[];
};

const allowedMime = ["image/jpeg", "image/png", "image/webp"];
const maxSizeMb =
  Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? 10) || 10;

function createEmptyChild(): ChildForm {
  return { id: crypto.randomUUID(), name: "", files: [] };
}

export default function HomePage() {
  const [guardianName, setGuardianName] = useState("");
  const [children, setChildren] = useState<ChildForm[]>([createEmptyChild()]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const totalPhotos = useMemo(
    () => children.reduce((acc, child) => acc + child.files.length, 0),
    [children]
  );

  function updateChildName(id: string, value: string) {
    setChildren((prev) =>
      prev.map((child) => (child.id === id ? { ...child, name: value } : child))
    );
  }

  function updateChildFiles(id: string, filesList: FileList | null) {
    const files = Array.from(filesList ?? []).slice(0, 3);
    setChildren((prev) =>
      prev.map((child) => (child.id === id ? { ...child, files } : child))
    );
  }

  function addChild() {
    setChildren((prev) => [...prev, createEmptyChild()]);
  }

  function removeChild(id: string) {
    setChildren((prev) => (prev.length === 1 ? prev : prev.filter((c) => c.id !== id)));
  }

  function validate(): string | null {
    if (!guardianName.trim()) return "Informe o nome do responsável.";
    if (children.some((c) => !c.name.trim()))
      return "Cada criança precisa ter um nome.";
    const invalidType = children.some((c) =>
      c.files.some((file) => !allowedMime.includes(file.type))
    );
    if (invalidType)
      return "Use apenas imagens JPEG, PNG ou WEBP.";
    const tooLarge = children.some((c) =>
      c.files.some((file) => file.size > maxSizeMb * 1024 * 1024)
    );
    if (tooLarge)
      return `Cada foto deve ter no máximo ${maxSizeMb} MB.`;
    const missingPhotos = children.some((c) => c.files.length !== 3);
    if (missingPhotos)
      return "Envie exatamente 3 fotos por criança.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setStatus("error");
      setMessage(validationError);
      return;
    }

    setStatus("loading");
    setMessage("Preparando upload e salvando dados...");

    try {
      const payload = {
        guardianName: guardianName.trim(),
        children: children.map((child, childIndex) => ({
          name: child.name.trim(),
          childIndex,
          photos: child.files.map((file, photoIndex) => ({
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
            photoIndex
          }))
        }))
      };

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível salvar a submissão.");
      }

      for (const target of data.uploadTargets as Array<{
        url: string;
        childIndex: number;
        photoIndex: number;
      }>) {
        const file =
          children[target.childIndex]?.files?.[target.photoIndex];
        if (!file) {
          throw new Error(
            "Não foi possível encontrar um arquivo para enviar. Tente novamente."
          );
        }

        const uploadResp = await fetch(target.url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream"
          },
          body: file
        });

        if (!uploadResp.ok) {
          throw new Error("Falha ao enviar um dos arquivos. Tente novamente.");
        }
      }

      setStatus("success");
      setMessage("Envio concluído! Obrigado por participar.");
      setGuardianName("");
      setChildren([createEmptyChild()]);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro inesperado. Tente novamente em instantes."
      );
    }
  }

  return (
    <main className="page">
      <div className="card">
        <h1 className="title">Formulário de fotos - formatura 2025</h1>
        <p className="muted">
          Precisamos de 3 fotos por criança para produzir o vídeo da
          formatura. Informe o nome do responsável, cadastre cada filho e
          anexe as fotos solicitadas.
        </p>

        <div className="instructions">
          <strong>Como funciona:</strong>
          <ul className="muted">
            <li>1) Preencha o nome do responsável.</li>
            <li>2) Adicione cada criança e informe o nome dela.</li>
            <li>
              3) Faça upload de <strong>3 fotos</strong> por criança (JPEG,
              PNG ou WEBP, máx. {maxSizeMb} MB cada).
            </li>
            <li>
              4) Envie o formulário e aguarde a confirmação de sucesso.
            </li>
          </ul>
        </div>

        <form className="row" onSubmit={handleSubmit}>
          <label className="row">
            <span className="section-title">Nome do responsável</span>
            <input
              className="input"
              required
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Digite o nome completo"
            />
          </label>

          <div className="child-header">
            <h3 className="section-title">Filhos</h3>
            <button
              type="button"
              className="button button-secondary"
              onClick={addChild}
            >
              + Adicionar filho
            </button>
          </div>

          <div className="row">
            {children.map((child, index) => (
              <div key={child.id} className="child-block">
                <div className="child-header">
                  <div className="tag">Criança #{index + 1}</div>
                  {children.length > 1 && (
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => removeChild(child.id)}
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="row" style={{ marginTop: 12 }}>
                  <label className="row">
                    <span className="muted">Nome completo</span>
                    <input
                      className="input"
                      required
                      value={child.name}
                      onChange={(e) => updateChildName(child.id, e.target.value)}
                      placeholder="Nome da criança"
                    />
                  </label>

                  <label className="row">
                    <span className="muted">
                      Fotos (3 arquivos - JPEG/PNG/WEBP)
                    </span>
                    <input
                      className="input"
                      type="file"
                      multiple
                      accept={allowedMime.join(",")}
                      onChange={(e) => updateChildFiles(child.id, e.target.files)}
                    />
                  </label>

                  <div className="file-list muted">
                    {child.files.length === 0 ? (
                      <span className="small">Nenhum arquivo selecionado.</span>
                    ) : (
                      child.files.map((file, fileIndex) => (
                        <div key={fileIndex}>
                          {fileIndex + 1}. {file.name} —{" "}
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="muted small">
              Total de crianças: {children.length} | Fotos carregadas:{" "}
              {totalPhotos} / {children.length * 3}
            </div>
            {message && (
              <div
                className={`status ${
                  status === "success"
                    ? "status-success"
                    : status === "error"
                    ? "status-error"
                    : "status-warning"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="button button-primary"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Enviando..." : "Enviar formulário"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

