import React, { useRef } from 'react';
import { View, Button, Alert, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from "react-native-chart-kit";
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system'; // Manejo de archivos
import * as Sharing from 'expo-sharing'; // Para compartir archivos
import { captureRef } from 'react-native-view-shot';

export default function GraficoProgreso({ dataProgreso, colors }) {
  const chartRef = useRef(); // Referencia al gráfico
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - screenWidth * 0.1; // Ancho ajustado según la pantalla
  const chartHeight = 300; // Altura del gráfico

  const generarPDF = async () => {
    try {
      // Capturar el gráfico como imagen
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: chartWidth,
        height: chartHeight,
      });

      // Crear una instancia de jsPDF
      const doc = new jsPDF();

      // Agregar título al PDF
      doc.text("Reporte de Progreso", 10, 10);

      // Leer la imagen capturada y agregarla al PDF
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 150, 110);

      // Agregar los datos al PDF
      dataProgreso.labels.forEach((label, index) => {
        const progreso = (dataProgreso.data[index] * 100).toFixed(2); // Convertir a porcentaje
        doc.text(`${label}: ${progreso}%`, 10, 140 + index * 10); // Ajustar posición para dejar espacio a la imagen
      });

      // Guardar el archivo PDF
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_progreso.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Compartir el archivo PDF
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <View ref={chartRef} collapsable={false} style={styles.chartContainer}>
        <ProgressChart
          data={dataProgreso}
          width={chartWidth}
          height={chartHeight}
          chartConfig={{
            backgroundColor: '#022173',
            backgroundGradientFrom: '#022173',
            backgroundGradientTo: '#1b3fa0',
            color: (opacity = 1, index) => colors[index] || `rgba(255, 255, 255, ${opacity})`,
          }}
          style={{
            borderRadius: 10,
          }}
          hideLegend={false}
          strokeWidth={10}
          radius={32}
        />
      </View>

      <View style={styles.button}>
        <Button title="Generar y Compartir PDF" onPress={generarPDF} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
});