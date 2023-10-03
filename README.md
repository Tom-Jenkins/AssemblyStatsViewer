# Assembly Stats Viewer
Assembly Stats Viewer is a web tool that allows users to compare genome assembly stats from the NCBI [assembly](https://www.ncbi.nlm.nih.gov/assembly) database. It works by fetching data via the NCBI Datasets v2 REST [API](https://www.ncbi.nlm.nih.gov/datasets/docs/v2/reference-docs/rest-api/#auth), and processing the result to render an interactive table presenting basic assembly stats (N50, number of contigs, total length, etc.) and, if available, a barchart of BUSCO completeness assessments.

Click <a href="https://assemblystatsviewer.netlify.app/" target="_blank">here</a> to launch the web application.

![AssemblyStatsViewer_Screenshot](https://github.com/Tom-Jenkins/AssemblyStatsViewer/assets/20986547/f06d4d40-d1d1-4e49-9246-38354c59c472)

**How to use:**

- Type one or more accession numbers (e.g. GCF_018350175) and/or taxon names (e.g. cat, Felis, Felis catus, etc.) into the text box.
- Users can submit multiple queries at once, separated by a new line.
- Using higher taxonomic ranks will work (e.g. Mammalia) but only the first 20 results will be shown to optimise usability and performance. By default, data for accession numbers will be prioritised before fetching data for taxon IDs.
- The table and barchart data can be copied or downloaded as required, and users are able to highlight the best assembly stat for relevant columns.

Please post any issues or feedback on the [GitHub](https://github.com/Tom-Jenkins/AssemblyStatsViewer) page.
