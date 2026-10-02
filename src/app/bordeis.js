import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("bordeis.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS bordeis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL
  );
`);

// Ajusta a coluna da primeira versão, mantendo os valores já salvos.
const colunas = db.getAllSync("PRAGMA table_info(bordeis)");
const temEndereco = colunas.some((coluna) => coluna.name === "endereco");
const temCor = colunas.some((coluna) => coluna.name === "cor");

if (temEndereco && !temCor) {
  db.execSync("ALTER TABLE bordeis RENAME COLUMN endereco TO cor");
}

function listar() {
  return db.getAllSync("SELECT * FROM bordeis ORDER BY id DESC");
}

function adicionar(nome, cor) {
  db.runSync(
    "INSERT INTO bordeis (nome, cor) VALUES (?, ?)",
    [nome, cor]
  );
}

function excluir(id) {
  db.runSync("DELETE FROM bordeis WHERE id = ?", [id]);
}

export default function ListaBordeis() {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("");
  const [lista, setLista] = useState([]);

  function carregar() {
    setLista(listar());
  }

  useEffect(() => {
    carregar();
  }, []);

  function salvar() {
    if (nome.trim() === "" || cor.trim() === "") {
      Alert.alert("Preenche os campos", "Informe o nome e a cor.");
      return;
    }

    adicionar(nome.trim(), cor.trim());
    setNome("");
    setCor("");
    carregar();
  }

  function remover(id) {
    excluir(id);
    carregar();
  }

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Lista de bordéis",
          headerStyle: { backgroundColor: "#C00000" },
          headerTintColor: "#FFFFFF",
        }}
      />

      <Text style={styles.titulo}>Novo bordel</Text>

      <TextInput
        style={styles.campo}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do bordel"
        placeholderTextColor="#000000"
      />

      <TextInput
        style={styles.campo}
        value={cor}
        onChangeText={setCor}
        placeholder="Cor"
        placeholderTextColor="#000000"
      />

      <Button title="Adicionar" onPress={salvar} color="#000000" />

      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemDados}>
              <Text style={styles.itemTexto}>{item.nome}</Text>
              <Text style={styles.itemCor}>{item.cor}</Text>
            </View>

            <Button
              title="Excluir"
              onPress={() => remover(item.id)}
              color="#000000"
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },

  campo: {
    borderWidth: 1,
    borderColor: "#D9DDE3",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    marginBottom: 12,
  },

  lista: {
    flex: 1,
    marginTop: 16,
  },

  item: {
    backgroundColor: "grey",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  itemDados: {
    flex: 1,
  },

  itemTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: "black",
  },

  itemCor: {
    fontSize: 14,
    color: "black",
    marginTop: 4,
  },
});