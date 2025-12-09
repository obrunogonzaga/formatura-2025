"use client";

import { useMemo, useState } from "react";
import Logo from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";

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
    <>
      <ThemeToggle />
      <main className="page">
        <div className="card">
        <Logo />
        <h1 className="title">Formulário de Fotos - Formatura 2025</h1>
        <p className="subtitle">
          Precisamos de 3 fotos por criança para produzir o vídeo da
          formatura. Informe o nome do responsável, cadastre cada filho e
          anexe as fotos solicitadas.
        </p>

        <div className="instructions">
          <strong>Como funciona:</strong>
          <ul>
            <li>Preencha o nome do responsável</li>
            <li>Adicione cada criança e informe o nome dela</li>
            <li>
              Faça upload de <strong>exatamente 3 fotos</strong> por criança (JPEG,
              PNG ou WEBP, máx. {maxSizeMb} MB cada)
            </li>
            <li>Envie o formulário e aguarde a confirmação de sucesso</li>
          </ul>
        </div>

        <form className="form-section" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="guardian-name">
              Nome do Responsável
            </label>
            <input
              id="guardian-name"
              className="input"
              required
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Digite o nome completo do responsável"
            />
          </div>

          <div className="children-section">
            <div className="section-header">
              <h2 className="section-title">Crianças</h2>
              <button
                type="button"
                className="button button-add"
                onClick={addChild}
              >
                + Adicionar Criança
              </button>
            </div>

            <div className="children-grid">
              {children.map((child, index) => (
                <div key={child.id} className="child-block">
                  <div className="child-header">
                    <div className="tag">Criança #{index + 1}</div>
                    {children.length > 1 && (
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() => removeChild(child.id)}
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="child-form">
                    <div className="input-group">
                      <label className="input-label" htmlFor={`child-name-${child.id}`}>
                        Nome Completo da Criança
                      </label>
                      <input
                        id={`child-name-${child.id}`}
                        className="input"
                        required
                        value={child.name}
                        onChange={(e) => updateChildName(child.id, e.target.value)}
                        placeholder="Digite o nome completo"
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor={`child-photos-${child.id}`}>
                        Fotos (3 arquivos)
                      </label>
                      <div className="file-input-wrapper">
                        <label 
                          htmlFor={`child-photos-${child.id}`}
                          className={`file-input-custom ${child.files.length > 0 ? 'has-files' : ''}`}
                        >
                          <span>
                            {child.files.length === 0
                              ? '📸 Clique para selecionar 3 fotos'
                              : `${child.files.length} foto(s) selecionada(s)`}
                          </span>
                        </label>
                        <input
                          id={`child-photos-${child.id}`}
                          type="file"
                          multiple
                          accept={allowedMime.join(",")}
                          onChange={(e) => updateChildFiles(child.id, e.target.files)}
                        />
                      </div>

                      {child.files.length > 0 && (
                        <div className="file-list">
                          {child.files.map((file, fileIndex) => (
                            <div key={fileIndex} className="file-item">
                              <span>
                                {file.name} — {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

          <div className="form-footer">
            <div className="summary">
              <div className="summary-item">
                <span className="summary-label">Crianças</span>
                <span className="summary-value">{children.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Fotos</span>
                <span className="summary-value">
                  {totalPhotos} / {children.length * 3}
                </span>
              </div>
            </div>

            <button
              className="button button-primary"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "⏳ Enviando..." : "🚀 Enviar Formulário"}
            </button>
          </div>
        </form>
      </div>
    </main>
    </>
  );
}

